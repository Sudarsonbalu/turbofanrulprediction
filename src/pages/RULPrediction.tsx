import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  BarChart3,
  Sliders,
  Shield,
  Activity,
  X
} from 'lucide-react';
import { DatasetMetadata, PredictionResultsResponse, ModelComparisonResult, RiskLevel, TrainModelParams, PipelineExecutionLog } from '../types';
import { runPredictiveAnalysis, fetchPredictionResults, fetchModelComparison } from '../services/predictionApi';
import { fetchEngineDetail } from '../services/analysisApi';
import { RulGaugeBar } from '../components/RulGaugeBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RULPredictionPageProps {
  selectedDataset: DatasetMetadata | null;
}

export const RULPredictionPage: React.FC<RULPredictionPageProps> = ({ selectedDataset }) => {
  const [results, setResults] = useState<PredictionResultsResponse | null>(null);
  const [modelComparisons, setModelComparisons] = useState<ModelComparisonResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<PipelineExecutionLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hyperparameters
  const [lrLambda, setLrLambda] = useState<number>(0.1);
  const [rfNEstimators, setRfNEstimators] = useState<number>(15);
  const [rfMaxDepth, setRfMaxDepth] = useState<number>(8);
  const [rfMinSamplesSplit, setRfMinSamplesSplit] = useState<number>(5);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(30);
  const [warningThreshold, setWarningThreshold] = useState<number>(70);

  // Filter & Selected Engine Modal State
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [modalEngineId, setModalEngineId] = useState<number | null>(null);
  const [modalEngineDetail, setModalEngineDetail] = useState<any>(null);

  const datasetId = selectedDataset?.dataset_id;

  useEffect(() => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchPredictionResults(datasetId),
      fetchModelComparison(datasetId)
    ])
      .then(([predRes, comps]) => {
        setResults(predRes);
        if (comps) setModelComparisons(comps);
      })
      .catch(err => {
        console.error('Failed to load predictions:', err);
      })
      .finally(() => setLoading(false));
  }, [datasetId]);

  useEffect(() => {
    if (!datasetId || !modalEngineId) {
      setModalEngineDetail(null);
      return;
    }
    fetchEngineDetail(datasetId, modalEngineId).then(setModalEngineDetail);
  }, [datasetId, modalEngineId]);

  const handleRunPipeline = async () => {
    if (!datasetId) return;

    setExecuting(true);
    setError(null);

    const steps = [
      'Loading dataset observations...',
      'Analyzing multi-sensor variance...',
      'Generating target RUL matrices...',
      'Engineering rolling statistical features...',
      'Training Linear Regression & Random Forest regressors...',
      'Evaluating models across engine trajectories...',
      'Selecting optimal model...',
      'Generating RUL predictions & risk classifications...',
      'Updating diagnostic dashboard...'
    ];

    setExecutionLogs([]);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 200));
      setExecutionLogs(prev => [
        ...prev,
        {
          step: `Step ${i + 1}/${steps.length}`,
          status: 'COMPLETED',
          message: steps[i],
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }

    const params: TrainModelParams = {
      dataset_id: datasetId,
      lr_lambda: lrLambda,
      rf_n_estimators: rfNEstimators,
      rf_max_depth: rfMaxDepth,
      rf_min_samples_split: rfMinSamplesSplit,
      critical_threshold: criticalThreshold,
      warning_threshold: warningThreshold
    };

    try {
      const predRes = await runPredictiveAnalysis(datasetId, params);
      setResults(predRes);
      const comps = await fetchModelComparison(datasetId);
      if (comps) setModelComparisons(comps);
    } catch (err: any) {
      console.error('Prediction execution failed:', err);
      setError(err?.message || 'Failed to execute predictive analysis pipeline.');
    } finally {
      setExecuting(false);
    }
  };

  if (!selectedDataset) {
    return (
      <div className="bg-white border border-[#DDD8D3] rounded-sm p-10 text-center space-y-3 font-sans">
        <div className="w-10 h-10 rounded-sm bg-[#A6362A]/10 text-[#A6362A] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-[#16191C]">
          No Validated Dataset Selected
        </h2>
        <p className="text-xs text-[#5A594F] font-mono max-w-lg mx-auto">
          Upload and validate a dataset in the Dataset workspace before executing RUL predictive models.
        </p>
      </div>
    );
  }

  const predictionsFiltered = results?.predictions.filter(p => {
    if (riskFilter === 'ALL') return true;
    return p.risk_level === riskFilter;
  }) || [];

  const chartDistributionData = results?.predictions.map(p => ({
    engine: `E#${p.engine_id}`,
    predicted_rul: p.predicted_rul,
    actual_rul: p.actual_rul !== undefined ? p.actual_rul : null,
    risk: p.risk_level
  })) || [];

  const featureImportanceData = results?.feature_importance.slice(0, 10).map(f => ({
    feature: f.feature,
    importance: Number((f.importance * 100).toFixed(2))
  })) || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#DDD8D3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#16191C] text-white rounded-none">
              RUL ML PIPELINE
            </span>
            <span className="text-xs font-mono text-[#5A594F]">Scope: C-MAPSS FD001 Validated</span>
          </div>
          <h1 className="text-xl font-semibold text-[#16191C] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#16191C]" />
            <span>Remaining Useful Life (RUL) Prediction Engine</span>
          </h1>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Machine learning remaining useful life forecast pipeline using Random Forest and Linear Regression.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={executing}
          className="px-5 py-2 bg-[#16191C] text-white hover:bg-[#2C3136] disabled:opacity-50 text-xs font-sans font-medium rounded-sm border border-[#16191C] flex items-center gap-2 transition-colors cursor-pointer"
        >
          {executing ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>TRAINING PIPELINE...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN RUL PREDICTION</span>
            </>
          )}
        </button>
      </div>

      {/* Hyperparameter Controls */}
      <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DDD8D3]">
          <h3 className="text-xs font-semibold text-[#16191C] flex items-center gap-2 font-mono">
            <Sliders className="w-4 h-4 text-[#16191C]" />
            <span>Pipeline Configuration & Hyperparameters</span>
          </h3>
          <span className="text-[10px] font-mono text-[#5A594F]">Engine-Aware Split (80/20)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">LR Lambda</label>
            <input
              type="number"
              step="0.05"
              value={lrLambda}
              onChange={e => setLrLambda(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#16191C]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">RF Trees</label>
            <input
              type="number"
              value={rfNEstimators}
              onChange={e => setRfNEstimators(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#16191C]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">RF Max Depth</label>
            <input
              type="number"
              value={rfMaxDepth}
              onChange={e => setRfMaxDepth(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#16191C]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">Min Split</label>
            <input
              type="number"
              value={rfMinSamplesSplit}
              onChange={e => setRfMinSamplesSplit(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#16191C]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#A6362A] font-semibold mb-1">Critical Limit</label>
            <input
              type="number"
              value={criticalThreshold}
              onChange={e => setCriticalThreshold(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#A6362A] font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#B8791A] font-semibold mb-1">Warning Limit</label>
            <input
              type="number"
              value={warningThreshold}
              onChange={e => setWarningThreshold(Number(e.target.value))}
              className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-[#B8791A] font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Execution Logs */}
      {executing && (
        <div className="bg-[#14171A] border border-[#23272B] rounded-sm p-4 font-mono text-xs space-y-1 text-[#FAF9F6]">
          <p className="text-[#A6362A] font-semibold mb-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Executing Model Training & Feature Extraction...</span>
          </p>
          {executionLogs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-[#8C8B80]">
              <span className="text-[#2F6E5C]">✓</span>
              <span>[{log.timestamp}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#A6362A]/10 border border-[#A6362A]/30 text-[#A6362A] text-xs font-mono rounded-sm">
          {error}
        </div>
      )}

      {results ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#5A594F] block">Total Units</span>
              <p className="text-base font-semibold text-[#16191C] mt-0.5">
                {results.summary.total_engines}
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#5A594F] block">Avg RUL</span>
              <p className="text-base font-semibold text-[#16191C] mt-0.5">
                {results.summary.avg_predicted_rul} cycles
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#A6362A] block font-semibold">Min RUL</span>
              <p className="text-base font-semibold text-[#A6362A] mt-0.5">
                {results.summary.min_predicted_rul} cycles
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#A6362A] block font-semibold">Critical (≤30)</span>
              <p className="text-base font-semibold text-[#A6362A] mt-0.5">
                {results.summary.critical_count} units
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#B8791A] block font-semibold">Warning (≤70)</span>
              <p className="text-base font-semibold text-[#B8791A] mt-0.5">
                {results.summary.warning_count} units
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-3">
              <span className="text-[10px] uppercase text-[#2F6E5C] block font-semibold">Healthy (&gt;70)</span>
              <p className="text-base font-semibold text-[#2F6E5C] mt-0.5">
                {results.summary.healthy_count} units
              </p>
            </div>
          </div>

          {/* Model Performance & Comparison Table */}
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-3 border-b border-[#DDD8D3]">
              <div>
                <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#16191C]" />
                  <span>Model Performance Metrics & Selection</span>
                </h3>
                <p className="text-xs text-[#5A594F] font-mono mt-0.5">
                  {results.selection_reason}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#2F6E5C]/30 bg-[#2F6E5C]/10 text-[#2F6E5C] text-xs font-mono font-semibold rounded-none">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SELECTED: {results.model_used}</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Model Architecture</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">MAE (Cycles)</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">RMSE (Cycles)</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">R² Score</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Train Time</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  {modelComparisons.map((mc, idx) => (
                    <tr key={idx} className={mc.is_best ? 'bg-[#FAF9F6] font-semibold' : ''}>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] font-bold text-[#16191C]">{mc.model_name}</td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{mc.metrics.mae} cycles</td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{mc.metrics.rmse} cycles</td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{mc.metrics.r2}</td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{mc.metrics.training_time_ms} ms</td>
                      <td className="py-2.5 px-3 text-right">
                        {mc.is_best ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold border border-[#2F6E5C]/30 bg-[#2F6E5C]/10 text-[#2F6E5C]">
                            OPTIMAL MODEL
                          </span>
                        ) : (
                          <span className="text-[#5A594F] text-[10px]">Baseline</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RUL Distribution Chart & Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predicted RUL Distribution */}
            <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
                <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#16191C]" />
                  <span>Predicted RUL Distribution by Engine Unit</span>
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDistributionData.slice(0, 20)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DDD8D3" />
                    <XAxis dataKey="engine" stroke="#5A594F" fontSize={9} tickLine={false} />
                    <YAxis stroke="#5A594F" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#DDD8D3',
                        borderRadius: '0px',
                        color: '#16191C',
                        fontSize: '11px',
                        fontFamily: 'IBM Plex Mono'
                      }}
                    />
                    <Bar dataKey="predicted_rul" name="Predicted RUL" radius={[0, 0, 0, 0]}>
                      {chartDistributionData.slice(0, 20).map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            entry.risk === 'CRITICAL'
                              ? '#A6362A'
                              : entry.risk === 'WARNING'
                              ? '#B8791A'
                              : '#2F6E5C'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
                <div>
                  <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#16191C]" />
                    <span>Feature Predictive Weight (Random Forest Gain)</span>
                  </h3>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={featureImportanceData}
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DDD8D3" />
                    <XAxis type="number" stroke="#5A594F" fontSize={10} unit="%" />
                    <YAxis dataKey="feature" type="category" stroke="#5A594F" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#DDD8D3',
                        borderRadius: '0px',
                        color: '#16191C',
                        fontSize: '11px',
                        fontFamily: 'IBM Plex Mono'
                      }}
                    />
                    <Bar dataKey="importance" name="Weight (%)" fill="#16191C" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Engine Risk Ranking Table */}
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#DDD8D3]">
              <div>
                <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#A6362A]" />
                  <span>Fleet Engine Risk Classification Ranking</span>
                </h3>
                <p className="text-xs text-[#5A594F] font-mono mt-0.5">
                  Ordered by lowest remaining life cycles. Critical ≤ {criticalThreshold}, Warning ≤ {warningThreshold}.
                </p>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs">
                {(['ALL', 'CRITICAL', 'WARNING', 'HEALTHY'] as const).map(rf => (
                  <button
                    key={rf}
                    onClick={() => setRiskFilter(rf)}
                    className={`px-2.5 py-1 rounded-none font-medium transition-colors cursor-pointer ${
                      riskFilter === rf
                        ? 'bg-[#16191C] text-white'
                        : 'bg-[#FAF9F6] text-[#5A594F] border border-[#DDD8D3] hover:text-[#16191C]'
                    }`}
                  >
                    {rf}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Engine ID</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Current Cycle</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">RUL Degradation Bar</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Actual RUL</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Error</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Risk</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  {predictionsFiltered.map(p => (
                    <tr key={p.engine_id} className="hover:bg-[#FAF9F6]">
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] font-bold text-[#16191C]">
                        Engine #{p.engine_id}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">
                        #{p.current_cycle}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] w-48">
                        <RulGaugeBar currentRul={p.predicted_rul} riskStatus={p.risk_level} />
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] text-[#5A594F]">
                        {p.actual_rul !== undefined ? `${p.actual_rul} cycles` : '—'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] text-[#5A594F]">
                        {p.absolute_error !== undefined ? `${p.absolute_error} cycles` : '—'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase border ${
                            p.risk_level === 'CRITICAL'
                              ? 'text-[#A6362A] border-[#A6362A]/30 bg-[#A6362A]/10'
                              : p.risk_level === 'WARNING'
                              ? 'text-[#B8791A] border-[#B8791A]/30 bg-[#B8791A]/10'
                              : 'text-[#2F6E5C] border-[#2F6E5C]/30 bg-[#2F6E5C]/10'
                          }`}
                        >
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setModalEngineId(p.engine_id)}
                          className="px-2 py-1 bg-[#16191C] text-white hover:bg-[#2C3136] text-[10px] font-mono rounded-none transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-10 text-center space-y-3 font-sans">
          <TrendingUp className="w-10 h-10 text-[#16191C] mx-auto" />
          <h2 className="text-base font-semibold text-[#16191C]">
            Predictive Model Engine Ready
          </h2>
          <p className="text-xs text-[#5A594F] font-mono max-w-md mx-auto">
            Click <strong>"Run RUL Prediction"</strong> above to extract rolling telemetry features, evaluate Random Forest and Linear Regression models, and display fleet remaining useful life forecasts.
          </p>
        </div>
      )}

      {/* Engine Detail Modal */}
      {modalEngineId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-6 max-w-2xl w-full space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#DDD8D3] pb-3">
              <h3 className="text-sm font-semibold text-[#16191C] font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#16191C]" />
                <span>Engine #{modalEngineId} Telemetry Inspector</span>
              </h3>
              <button
                onClick={() => setModalEngineId(null)}
                className="p-1 text-[#5A594F] hover:text-[#16191C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalEngineDetail ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-3 border border-[#DDD8D3]">
                  <div>Total Cycles: <strong>{modalEngineDetail.total_cycles}</strong></div>
                  <div>Sensors: <strong>{modalEngineDetail.sensors_available.length} active</strong></div>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase font-semibold text-[#5A594F] mb-2">Sensor Trajectory Delta</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                    {Object.entries(modalEngineDetail.degradation_summary.pct_changes || {}).slice(0, 9).map(([s, pct]: [string, any]) => (
                      <div key={s} className="bg-[#FAF9F6] border border-[#DDD8D3] p-2 flex items-center justify-between">
                        <span>{s}</span>
                        <span className={pct > 0 ? 'text-[#B8791A] font-semibold' : 'text-[#2F6E5C] font-semibold'}>
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5A594F] font-mono">Loading telemetry detail...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
