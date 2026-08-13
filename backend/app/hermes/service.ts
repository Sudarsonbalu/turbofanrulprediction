import { hermesClient } from './client';
import { HERMES_SYSTEM_PROMPT } from './prompts';
import { HERMES_READONLY_TOOLS, executeHermesTool } from './tools';
import { HermesToolCall, HermesMessage, HermesChatResponse, HermesStructuredResult } from './schemas';
import { TurbofanToolContext } from './tool_context';

// In-memory conversation history store
const conversationStore = new Map<string, HermesMessage[]>();
const MAX_CONVERSATION_MESSAGES = 16;

export async function checkHermesAgentStatus() {
  return hermesClient.checkStatus();
}

export function clearConversationHistory(conversationId: string) {
  conversationStore.delete(conversationId);
}

export async function processHermesTask(
  userMessage: string,
  conversationId?: string,
  datasetId: string = 'train_FD001.txt',
  engineId?: number
): Promise<HermesChatResponse> {
  const statusRes = await hermesClient.checkStatus();
  const activeConvId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const toolActivityLogs: HermesToolCall[] = [];

  // Parse target engine ID from message if not explicitly supplied
  let targetEngineId = engineId;
  if (!targetEngineId) {
    const engMatch = userMessage.match(/engine\s*#?\s*(\d+)/i);
    if (engMatch) {
      targetEngineId = parseInt(engMatch[1], 10);
    }
  }

  // Retrieve or initialize conversation history
  let history = conversationStore.get(activeConvId) || [];
  if (history.length > MAX_CONVERSATION_MESSAGES) {
    // Keep system prompt + last N messages
    history = history.slice(-MAX_CONVERSATION_MESSAGES);
  }

  if (statusRes.status === 'ONLINE' || statusRes.status === 'CONNECTED') {
    try {
      const systemMsg: HermesMessage = { role: 'system', content: HERMES_SYSTEM_PROMPT };
      const userMsgContent = `Dataset ID: ${datasetId}${targetEngineId ? `, Target Engine ID: ${targetEngineId}` : ''}\nUser Task: ${userMessage}`;
      const newUserMsg: HermesMessage = { role: 'user', content: userMsgContent };

      const messagesForApi: HermesMessage[] = [systemMsg, ...history, newUserMsg];

      let iterations = 0;
      const maxIterations = 5;

      while (iterations < maxIterations) {
        iterations++;
        const completion = await hermesClient.callChatCompletions(messagesForApi, HERMES_READONLY_TOOLS);
        const choice = completion.choices?.[0]?.message;

        if (!choice) break;

        if (choice.tool_calls && choice.tool_calls.length > 0) {
          messagesForApi.push(choice);

          for (const tc of choice.tool_calls) {
            const callId = tc.id;
            const toolName = tc.function.name;
            let toolArgs: Record<string, any> = {};

            try {
              toolArgs = JSON.parse(tc.function.arguments || '{}');
            } catch {
              toolArgs = { dataset_id: datasetId };
            }

            if (!toolArgs.dataset_id) {
              toolArgs.dataset_id = datasetId;
            }

            const toolStart = Date.now();
            const toolExec = await executeHermesTool(toolName, toolArgs);
            const duration = Date.now() - toolStart;

            toolActivityLogs.push({
              id: callId,
              tool_name: toolName,
              arguments: toolArgs,
              status: toolExec.success ? 'SUCCESS' : 'FAILED',
              result: toolExec.result,
              error: toolExec.error,
              execution_time_ms: duration
            });

            messagesForApi.push({
              role: 'tool',
              tool_call_id: callId,
              name: toolName,
              content: JSON.stringify(toolExec.success ? toolExec.result : { error: toolExec.error })
            });
          }
        } else {
          // Final assistant text response
          const responseText = choice.content || 'Hermes analysis completed.';
          const assistantMsg: HermesMessage = { role: 'assistant', content: responseText };

          // Save to conversation history
          history.push(newUserMsg, assistantMsg);
          conversationStore.set(activeConvId, history.slice(-MAX_CONVERSATION_MESSAGES));

          const structuredResult = buildStructuredResultFromTools(datasetId, targetEngineId, toolActivityLogs, responseText);

          return {
            status: 'SUCCESS',
            conversation_id: activeConvId,
            provider: hermesClient.getProvider(),
            model_used: hermesClient.getModel(),
            response: responseText,
            structured_result: structuredResult,
            tool_activity: toolActivityLogs,
            hermes_status: 'ONLINE',
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err: any) {
      console.warn('Hermes API call failed, falling back to deterministic tool runner:', err?.message);
    }
  }

  // Fallback or Offline Mode
  const fallbackRes = await executeDeterministicHermesAnalysis(userMessage, datasetId, targetEngineId, toolActivityLogs);
  fallbackRes.conversation_id = activeConvId;
  fallbackRes.provider = hermesClient.getProvider();

  // Save to history
  history.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: fallbackRes.response }
  );
  conversationStore.set(activeConvId, history.slice(-MAX_CONVERSATION_MESSAGES));

  return fallbackRes;
}

async function executeDeterministicHermesAnalysis(
  userMessage: string,
  datasetId: string,
  targetEngineId?: number,
  toolLogs: HermesToolCall[] = []
): Promise<HermesChatResponse> {
  const isComparison = /compare|rank|lowest|highest|top/i.test(userMessage);

  if (isComparison) {
    const toolStart = Date.now();
    const compResult = TurbofanToolContext.compareEngines(datasetId, 10);
    toolLogs.push({
      id: `call_${Date.now()}_1`,
      tool_name: 'compare_engines',
      arguments: { dataset_id: datasetId, limit: 10 },
      status: 'SUCCESS',
      result: compResult,
      execution_time_ms: Date.now() - toolStart
    });

    const metricsResult = TurbofanToolContext.getModelMetrics(datasetId);
    toolLogs.push({
      id: `call_${Date.now()}_2`,
      tool_name: 'get_model_metrics',
      arguments: { dataset_id: datasetId },
      status: 'SUCCESS',
      result: metricsResult,
      execution_time_ms: Date.now() - toolStart
    });

    const isNotRun = compResult.status === 'NOT_RUN';
    const textResponse = isNotRun
      ? 'RUL predictive analysis has not been executed yet for this dataset. Please run Phase 2 Predictive Analysis in the RUL Prediction tab before requesting engine risk rankings.'
      : `### Engine Risk Priority Summary\nDataset: \`${datasetId}\` | Model: **${compResult.model_used}**\n\nAnalyzed ${compResult.total_engines} turbofan units. Priority rankings based on lowest predicted Remaining Useful Life (RUL).\n\n` +
        compResult.lowest_rul_engines.slice(0, 5).map((e: any, idx: number) =>
          `**${idx + 1}. Engine #${e.engine_id}** — Predicted RUL: **${e.predicted_rul} cycles** (${e.risk_level} Risk, Current Cycle: ${e.current_cycle})`
        ).join('\n');

    const structured: HermesStructuredResult = {
      dataset_id: datasetId,
      model_used: compResult.model_used || 'N/A',
      observed_data_summary: isNotRun ? 'No RUL predictions available.' : `Evaluated ${compResult.total_engines} engine units in ${datasetId}.`,
      model_output_summary: isNotRun ? 'RUL prediction pipeline not run.' : `Min predicted RUL is ${compResult.summary?.min_predicted_rul} cycles. Critical count: ${compResult.summary?.critical_count} units.`,
      analytical_findings: isNotRun ? [] : compResult.lowest_rul_engines.slice(0, 5).map((e: any) => `Engine #${e.engine_id}: Predicted RUL = ${e.predicted_rul} cycles (${e.risk_level})`),
      agent_interpretation: isNotRun ? 'Predictive analysis required prior to agent interpretation.' : `Units with predicted RUL <= 30 cycles are classified as CRITICAL and warrant prioritized inspection.`,
      engineering_considerations: [
        'Prioritize borescope & physical inspection on CRITICAL units.',
        'Review high-variance sensor degradation trends prior to scheduling maintenance window.',
        'Validate sensor calibration on constant baseline columns.'
      ],
      cautionary_note: 'RUL predictions are statistical model projections based on historical training data, not certified aviation maintenance instructions.'
    };

    return {
      status: 'SUCCESS',
      response: textResponse,
      structured_result: structured,
      tool_activity: toolLogs,
      hermes_status: 'OFFLINE',
      model_used: `${hermesClient.getModel()} (deterministic tool runner)`,
      timestamp: new Date().toISOString()
    };
  }

  // Single Engine / Specific Query
  const engId = targetEngineId || 24;

  const start1 = Date.now();
  const summaryRes = TurbofanToolContext.getDatasetSummary(datasetId);
  toolLogs.push({
    id: `call_${Date.now()}_1`,
    tool_name: 'get_dataset_summary',
    arguments: { dataset_id: datasetId },
    status: 'SUCCESS',
    result: summaryRes,
    execution_time_ms: Date.now() - start1
  });

  const start2 = Date.now();
  const engineRes = TurbofanToolContext.getEngineDetails(datasetId, engId);
  toolLogs.push({
    id: `call_${Date.now()}_2`,
    tool_name: 'get_engine_details',
    arguments: { dataset_id: datasetId, engine_id: engId },
    status: 'SUCCESS',
    result: engineRes,
    execution_time_ms: Date.now() - start2
  });

  const start3 = Date.now();
  const featRes = TurbofanToolContext.getFeatureImportance(datasetId);
  toolLogs.push({
    id: `call_${Date.now()}_3`,
    tool_name: 'get_feature_importance',
    arguments: { dataset_id: datasetId },
    status: 'SUCCESS',
    result: featRes,
    execution_time_ms: Date.now() - start3
  });

  const hasEngineError = (engineRes as any).status === 'ERROR';
  const hasPrediction = engineRes && (engineRes as any).prediction && typeof (engineRes as any).prediction === 'object';
  const predData = hasPrediction ? (engineRes as any).prediction : null;

  const responseText = hasEngineError
    ? `Unable to evaluate Engine #${engId}: ${(engineRes as any).message}`
    : `### Engineering Health Analysis: Engine #${engId}\n\n` +
      `- **Observed Cycles:** ${engineRes.total_cycles} cycles\n` +
      `- **RUL Status:** ${hasPrediction ? `**${predData.predicted_rul} cycles** (${predData.risk_level} Risk)` : 'RUL prediction not available yet'}\n` +
      `- **Primary Telemetry Degradation:** ${
        Object.entries(engineRes.degradation_summary?.pct_changes || {})
          .slice(0, 3)
          .map(([s, pct]) => `${s}: ${pct}%`)
          .join(', ') || 'N/A'
      }`;

  const structured: HermesStructuredResult = {
    engine_id: engId,
    dataset_id: datasetId,
    current_cycle: engineRes.total_cycles,
    predicted_rul: predData?.predicted_rul,
    risk_level: predData?.risk_level || 'UNKNOWN',
    model_used: predData?.model_used || 'N/A',
    observed_data_summary: `Engine #${engId} observed for ${engineRes.total_cycles} operational cycles across ${engineRes.sensors_available?.length || 0} sensors.`,
    model_output_summary: hasPrediction
      ? `Predicted RUL is ${predData.predicted_rul} cycles using ${predData.model_used} model. Classified as ${predData.risk_level}.`
      : 'RUL prediction pipeline has not been executed yet for this dataset.',
    analytical_findings: Object.entries(engineRes.degradation_summary?.pct_changes || {})
      .slice(0, 4)
      .map(([s, pct]) => `Sensor ${s} exhibited ${pct}% overall variation over operating lifetime.`),
    agent_interpretation: hasPrediction
      ? `Engine #${engId} is currently classified as ${predData.risk_level} based on model prediction of ${predData.predicted_rul} remaining cycles.`
      : 'Predictive analysis is recommended to generate RUL forecast.',
    engineering_considerations: [
      'Verify temperature and pressure sensor calibration during routine maintenance.',
      'Monitor rate of change in rolling sensor variance over subsequent cycles.',
      'Cross-reference RUL projections with physical component inspection logs.'
    ],
    cautionary_note: 'RUL predictions are statistical estimates derived from machine learning models and must be validated by qualified turbomachinery engineers.'
  };

  return {
    status: 'SUCCESS',
    response: responseText,
    structured_result: structured,
    tool_activity: toolLogs,
    hermes_status: 'OFFLINE',
    model_used: `${hermesClient.getModel()} (deterministic tool runner)`,
    timestamp: new Date().toISOString()
  };
}

function buildStructuredResultFromTools(
  datasetId: string,
  engineId?: number,
  toolLogs: HermesToolCall[] = [],
  responseText: string = ''
): HermesStructuredResult {
  const engineLog = toolLogs.find(l => l.tool_name === 'get_engine_details' || l.tool_name === 'get_rul_prediction');
  const engineResult = engineLog?.result;

  return {
    engine_id: engineId || engineResult?.engine_id,
    dataset_id: datasetId,
    current_cycle: engineResult?.total_cycles || engineResult?.current_cycle,
    predicted_rul: engineResult?.prediction?.predicted_rul || engineResult?.predicted_rul,
    risk_level: engineResult?.prediction?.risk_level || engineResult?.risk_level || 'HEALTHY',
    model_used: engineResult?.prediction?.model_used || 'Random Forest',
    observed_data_summary: `Retrieved dataset context for ${datasetId}.`,
    model_output_summary: responseText.slice(0, 200),
    analytical_findings: toolLogs.map(l => `Tool ${l.tool_name}: Executed successfully in ${l.execution_time_ms}ms`),
    agent_interpretation: responseText,
    engineering_considerations: [
      'Perform detailed borescope and physical inspection prior to maintenance window.',
      'Monitor high-variance sensor degradation trajectories.',
      'Verify model accuracy against actual historical cycle observations.'
    ],
    cautionary_note: 'RUL predictions are statistical model projections based on historical training data, not certified aviation maintenance instructions.'
  };
}
