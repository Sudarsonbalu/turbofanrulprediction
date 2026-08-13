import { HermesStatusResponse, HermesChatResponse } from '../../backend/app/hermes/schemas';
import { executeClientHermesTask, getClientHermesStatus } from './clientHermesService';

export async function fetchHermesStatus(): Promise<HermesStatusResponse> {
  try {
    const response = await fetch('/api/hermes/health');
    if (response.ok) {
      const data = await response.json();
      if (data && data.status && data.status !== 'OFFLINE') {
        return data;
      }
    }
  } catch {
    // ignore
  }

  return getClientHermesStatus();
}

export async function fetchHermesCapabilities(): Promise<any> {
  try {
    const response = await fetch('/api/hermes/capabilities');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  return {
    read_only_tools: [
      { name: 'get_dataset_summary', description: 'Retrieve high-level statistical summary' },
      { name: 'get_engine_details', description: 'Retrieve detailed telemetry trajectories for a specific engine' },
      { name: 'get_sensor_analytics', description: 'Retrieve sensor correlation and variance statistics' },
      { name: 'compare_engines', description: 'Rank fleet engines by predicted remaining useful life' }
    ],
    access_level: 'READ_ONLY_ENGINEERING_INTELLIGENCE'
  };
}

export async function sendHermesTask(
  message: string,
  conversationId?: string,
  datasetId?: string,
  engineId?: number
): Promise<HermesChatResponse> {
  try {
    const response = await fetch('/api/hermes/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        dataset_id: datasetId,
        engine_id: engineId
      })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  return executeClientHermesTask(message, conversationId, datasetId || 'train_FD001.txt', engineId);
}

export async function analyzeEngineWithHermes(
  datasetId: string,
  engineId: number
): Promise<HermesChatResponse> {
  try {
    const response = await fetch('/api/hermes/analyze-engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId, engine_id: engineId })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  return executeClientHermesTask(`Analyze Engine #${engineId} in detail. Evaluate degradation, predicted RUL, and key sensor trends.`, undefined, datasetId, engineId);
}

export async function compareEnginesWithHermes(
  datasetId: string
): Promise<HermesChatResponse> {
  try {
    const response = await fetch('/api/hermes/compare-engines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  return executeClientHermesTask('Rank and compare all engines by lowest predicted RUL. Highlight critical risk units.', undefined, datasetId);
}
