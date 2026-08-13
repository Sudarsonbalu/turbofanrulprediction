import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, Cpu, Activity, Terminal, User, Mail, Phone } from 'lucide-react';
import { PipelineWorkflow } from '../components/PipelineWorkflow';
import { DatasetMetadata, PredictionResultsResponse } from '../types';
import { fetchPredictionResults } from '../services/predictionApi';

interface OverviewProps {
  selectedDataset: DatasetMetadata | null;
  onNavigateToDataset: () => void;
  onNavigateToPrediction?: () => void;
  onNavigateToAgent?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  selectedDataset,
  onNavigateToDataset,
  onNavigateToPrediction,
  onNavigateToAgent
}) => {
  const [predictionSummary, setPredictionSummary] = useState<PredictionResultsResponse | null>(null);

  useEffect(() => {
    if (selectedDataset?.dataset_id) {
      fetchPredictionResults(selectedDataset.dataset_id)
        .then(setPredictionSummary)
        .catch(() => setPredictionSummary(null));
    } else {
      setPredictionSummary(null);
    }
  }, [selectedDataset?.dataset_id]);

  return (
    <div className="space-y-6 font-sans">
      {/* Operational Mission Console Banner */}
      <div className="bg-[#14171A] text-[#FAF9F6] border border-[#23272B] rounded-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23272B] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 bg-[#A6362A] text-white font-semibold uppercase">
                MRO CONSOLE ACTIVE
              </span>
              <span className="text-[#8C8B80]">NASA C-MAPSS BENCHMARK FD001</span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Fleet Telemetry & Operational Diagnostic Console
            </h1>
            <p className="text-xs text-[#8C8B80] mt-1 font-mono max-w-3xl leading-relaxed">
              Real-time multi-sensor telemetry processing, machine learning Remaining Useful Life (RUL) forecasting, and Hermes AI copilot intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
            <button
              onClick={onNavigateToDataset}
              className="px-3.5 py-2 bg-white text-[#16191C] hover:bg-[#FAF9F6] font-sans font-medium text-xs rounded-sm transition-colors cursor-pointer"
            >
              Workspace Datasets
            </button>
            {onNavigateToPrediction && (
              <button
                onClick={onNavigateToPrediction}
                className="px-3.5 py-2 bg-[#A6362A] text-white hover:bg-[#B83E31] font-sans font-medium text-xs rounded-sm transition-colors cursor-pointer"
              >
                Run RUL Engine
              </button>
            )}
          </div>
        </div>

        {/* Quick Instrumentation Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[#1F2327] border border-[#23272B] p-3.5 rounded-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8C8B80] uppercase">Monitored Fleet</span>
              <Cpu className="w-3.5 h-3.5 text-[#A6362A]" />
            </div>
            <p className="text-xl font-semibold text-white">100 UNITS</p>
            <p className="text-[10px] text-[#8C8B80] mt-0.5">Turbofan Engines</p>
          </div>

          <div className="bg-[#1F2327] border border-[#23272B] p-3.5 rounded-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8C8B80] uppercase">Sensors Tracked</span>
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xl font-semibold text-white">21 CHANNELS</p>
            <p className="text-[10px] text-[#8C8B80] mt-0.5">Temp, Pressure & Speeds</p>
          </div>

          <div className="bg-[#1F2327] border border-[#23272B] p-3.5 rounded-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8C8B80] uppercase">Validation Accuracy</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#2F6E5C]" />
            </div>
            <p className="text-xl font-semibold text-[#2F6E5C]">MAE 14.2</p>
            <p className="text-[10px] text-[#8C8B80] mt-0.5">Cycles Baseline</p>
          </div>

          <div className="bg-[#1F2327] border border-[#23272B] p-3.5 rounded-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8C8B80] uppercase">Hermes Agent</span>
              <Terminal className="w-3.5 h-3.5 text-[#A6362A]" />
            </div>
            <p className="text-xl font-semibold text-[#A6362A]">READ-ONLY</p>
            <p className="text-[10px] text-[#8C8B80] mt-0.5">Solar Pro 4 Protocol</p>
          </div>
        </div>
      </div>

      {/* Fleet Remaining Useful Life Summary (When Prediction Available) */}
      {predictionSummary && (
        <div className="bg-white border border-[#DDD8D3] p-5 rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD8D3]">
            <div>
              <h3 className="text-sm font-semibold text-[#16191C] font-sans flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#A6362A]" />
                <span>Fleet Remaining Useful Life (RUL) Summary</span>
              </h3>
              <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
                Model: <strong className="text-[#16191C]">{predictionSummary.model_used}</strong> • MAE: {predictionSummary.metrics.mae} cycles • RMSE: {predictionSummary.metrics.rmse} cycles
              </p>
            </div>

            {onNavigateToPrediction && (
              <button
                onClick={onNavigateToPrediction}
                className="px-3 py-1.5 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] transition-colors cursor-pointer"
              >
                View Full Predictions
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm">
              <span className="text-[10px] text-[#5A594F] uppercase block">Total Engines</span>
              <span className="text-base font-semibold text-[#16191C]">
                {predictionSummary.summary.total_engines}
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm">
              <span className="text-[10px] text-[#5A594F] uppercase block">Avg RUL</span>
              <span className="text-base font-semibold text-[#16191C]">
                {predictionSummary.summary.avg_predicted_rul} cycles
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm">
              <span className="text-[10px] text-[#A6362A] uppercase font-semibold block">Critical (≤30)</span>
              <span className="text-base font-semibold text-[#A6362A]">
                {predictionSummary.summary.critical_count} units
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm">
              <span className="text-[10px] text-[#B8791A] uppercase font-semibold block">Warning (≤70)</span>
              <span className="text-base font-semibold text-[#B8791A]">
                {predictionSummary.summary.warning_count} units
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm">
              <span className="text-[10px] text-[#2F6E5C] uppercase font-semibold block">Healthy (&gt;70)</span>
              <span className="text-base font-semibold text-[#2F6E5C]">
                {predictionSummary.summary.healthy_count} units
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Integrated Pipeline Workflow */}
      <PipelineWorkflow />

      {/* Active Dataset Ingestion Panel */}
      <div className="bg-white border border-[#DDD8D3] p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
          <div>
            <h3 className="text-sm font-semibold text-[#16191C] font-sans">
              Active NASA Telemetry Dataset
            </h3>
            <p className="text-xs text-[#5A594F]">
              Ingestion status for run-to-failure propulsion telemetry.
            </p>
          </div>

          <button
            onClick={onNavigateToDataset}
            className="px-3 py-1.5 bg-white text-[#16191C] hover:bg-[#FAF9F6] text-xs font-sans font-medium rounded-sm border border-[#DDD8D3] transition-colors cursor-pointer"
          >
            Manage Datasets
          </button>
        </div>

        {selectedDataset ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm font-mono text-xs">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-[#16191C]" />
                <span className="font-semibold text-[#16191C] text-sm">
                  {selectedDataset.filename}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                    selectedDataset.status === 'VALID'
                      ? 'text-[#2F6E5C] border-[#2F6E5C]/40 bg-[#2F6E5C]/10'
                      : 'text-[#B8791A] border-[#B8791A]/40 bg-[#B8791A]/10'
                  }`}
                >
                  {selectedDataset.status}
                </span>
              </div>
              <span className="text-[#5A594F] text-[11px]">
                Uploaded: {new Date(selectedDataset.uploaded_at).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-white border border-[#DDD8D3] rounded-sm">
                <span className="text-[10px] text-[#5A594F] uppercase block">Telemetry Rows</span>
                <span className="font-semibold text-[#16191C] text-sm">
                  {selectedDataset.summary.rows.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#DDD8D3] rounded-sm">
                <span className="text-[10px] text-[#5A594F] uppercase block">Engine Units</span>
                <span className="font-semibold text-[#16191C] text-sm">
                  {selectedDataset.summary.engines}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#DDD8D3] rounded-sm">
                <span className="text-[10px] text-[#5A594F] uppercase block">Sensors Tracked</span>
                <span className="font-semibold text-[#16191C] text-sm">
                  {selectedDataset.summary.sensors}
                </span>
              </div>

              <div className="p-3 bg-white border border-[#DDD8D3] rounded-sm">
                <span className="text-[10px] text-[#5A594F] uppercase block">Max Cycle</span>
                <span className="font-semibold text-[#16191C] text-sm">
                  {selectedDataset.summary.max_cycle} cycles
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-[#DDD8D3] bg-[#FAF9F6] font-mono text-xs">
            <p className="text-[#16191C] font-semibold">No dataset selected</p>
            <p className="text-[#5A594F] mt-1">Upload NASA C-MAPSS dataset text files to begin analysis.</p>
            <button
              onClick={onNavigateToDataset}
              className="mt-3 px-3 py-1.5 bg-[#16191C] text-white text-xs font-sans rounded-sm hover:bg-[#2C3136] transition-colors"
            >
              Upload train_FD001.txt
            </button>
          </div>
        )}
      </div>

      {/* Developer & Author Credits Banner */}
      <div className="bg-white border border-[#DDD8D3] p-4 rounded-sm font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-[#A6362A]" />
          <div>
            <span className="text-[#16191C] font-bold">Developed by Sudarson B</span>
            <span className="text-[#5A594F] text-[11px] ml-2 font-normal">(AI & DS Student)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#5A594F]">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#16191C]" />
            <a href="mailto:sudarsonbalu@gmail.com" className="text-[#16191C] font-semibold hover:underline">
              sudarsonbalu@gmail.com
            </a>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#16191C]" />
            <a href="tel:+919361138890" className="text-[#16191C] font-semibold hover:underline">
              +91 9361138890
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
