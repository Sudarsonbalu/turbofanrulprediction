import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Search,
  Cpu,
  BarChart2,
  Bot,
  Sparkles,
  Loader2
} from 'lucide-react';
import { DatasetMetadata, PredictionResultsResponse, EnginePredictionResult } from '../types';
import { fetchPredictionResults } from '../services/predictionApi';
import { sendHermesTask } from '../services/hermesApi';

interface ReportsPageProps {
  selectedDataset: DatasetMetadata | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ selectedDataset }) => {
  const [predictions, setPredictions] = useState<PredictionResultsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEngine, setSelectedEngine] = useState<EnginePredictionResult | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [aiReportSummary, setAiReportSummary] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);

  const datasetId = selectedDataset?.dataset_id || 'train_FD001.txt';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPredictionResults(datasetId)
      .then(res => {
        if (mounted) setPredictions(res);
      })
      .catch(err => {
        console.error('Error loading report prediction data:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [datasetId]);

  const handleGenerateAiSummary = async () => {
    setGeneratingAi(true);
    try {
      const prompt = `Generate an executive fleet maintenance report summary for dataset ${datasetId}. Detail critical risk engines, RUL accuracy metrics, and recommended maintenance interventions.`;
      const res = await sendHermesTask(prompt, datasetId);
      setAiReportSummary(res.response);
    } catch (err: any) {
      setAiReportSummary(`Failed to generate AI executive summary: ${err?.message || 'Agent error'}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      report_title: "TurbofanAI Fleet Maintenance & Risk Report",
      generated_at: new Date().toISOString(),
      dataset_id: datasetId,
      summary: predictions?.summary,
      model_used: predictions?.model_used,
      metrics: predictions?.metrics,
      critical_engines: predictions?.predictions.filter(p => p.risk_level === 'CRITICAL'),
      ai_executive_summary: aiReportSummary
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `turbofan_fleet_report_${datasetId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredEngines = (predictions?.predictions || []).filter(eng => {
    const matchesRisk = filterRisk === 'ALL' || eng.risk_level === filterRisk;
    const matchesSearch = searchTerm === '' || eng.engine_id.toString().includes(searchTerm);
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DDD8D3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#16191C] text-white rounded-none">
              MRO COMPLIANCE
            </span>
            <span className="text-xs font-mono text-[#5A594F]">{datasetId}</span>
          </div>
          <h1 className="text-xl font-semibold text-[#16191C] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#16191C]" />
            <span>Fleet Maintenance & Work Order Reports</span>
          </h1>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Work order generation, JSON compliance exports, and risk status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiSummary}
            disabled={generatingAi}
            className="px-3 py-1.5 bg-[#FAF9F6] text-[#16191C] hover:bg-white border border-[#DDD8D3] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 rounded-sm cursor-pointer"
          >
            {generatingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16191C]" />
                <span>Generating Executive Brief...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#A6362A]" />
                <span>Hermes Executive Brief</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-white text-[#16191C] hover:bg-[#FAF9F6] border border-[#DDD8D3] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors rounded-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5A594F]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#16191C] text-white hover:bg-[#2C3136] border border-[#16191C] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors rounded-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-1">
          <p className="text-[10px] text-[#5A594F] uppercase">Total Fleet Units</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-[#16191C]">
              {predictions?.summary?.total_engines || '—'}
            </span>
            <Cpu className="w-4 h-4 text-[#16191C]" />
          </div>
          <p className="text-[11px] text-[#5A594F]">Dataset: {datasetId}</p>
        </div>

        <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-1">
          <p className="text-[10px] text-[#A6362A] uppercase font-semibold">Critical Risk Units</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-[#A6362A]">
              {predictions?.summary?.critical_count || 0}
            </span>
            <ShieldAlert className="w-4 h-4 text-[#A6362A]" />
          </div>
          <p className="text-[11px] text-[#A6362A]">RUL ≤ 30 cycles</p>
        </div>

        <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-1">
          <p className="text-[10px] text-[#B8791A] uppercase font-semibold">Warning Risk Units</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-[#B8791A]">
              {predictions?.summary?.warning_count || 0}
            </span>
            <AlertTriangle className="w-4 h-4 text-[#B8791A]" />
          </div>
          <p className="text-[11px] text-[#B8791A]">30 &lt; RUL ≤ 70 cycles</p>
        </div>

        <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-1">
          <p className="text-[10px] text-[#2F6E5C] uppercase font-semibold">Validation Accuracy</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-[#2F6E5C]">
              {predictions?.metrics?.mae ? `${predictions.metrics.mae} cycles` : '—'}
            </span>
            <BarChart2 className="w-4 h-4 text-[#2F6E5C]" />
          </div>
          <p className="text-[11px] text-[#5A594F]">Model: {predictions?.model_used || 'Random Forest'}</p>
        </div>
      </div>

      {/* Hermes Executive Brief */}
      {aiReportSummary && (
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-[#DDD8D3] pb-2 font-mono">
            <h3 className="text-xs font-semibold uppercase text-[#16191C] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#A6362A]" />
              Hermes AI Executive Summary
            </h3>
            <span className="text-[10px] text-[#5A594F]">{new Date().toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-[#16191C] leading-relaxed whitespace-pre-wrap">
            {aiReportSummary}
          </p>
        </div>
      )}

      {/* Work Orders Table */}
      <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD8D3]">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#16191C]" />
            <h3 className="text-sm font-semibold text-[#16191C]">
              Engine Work Orders & Maintenance Schedule
            </h3>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5A594F] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter Engine ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-[#FAF9F6] border border-[#DDD8D3] rounded-none pl-8 pr-3 py-1 text-xs text-[#16191C] focus:outline-none focus:border-[#16191C] w-36"
              />
            </div>

            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-2.5 py-1 text-xs text-[#16191C] focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="HEALTHY">Healthy Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Engine Unit</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Current Cycle</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Predicted RUL</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Risk Status</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Action Recommendation</th>
                <th className="py-2.5 px-3 text-right">Work Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5A594F]">
                    Loading work order database...
                  </td>
                </tr>
              ) : filteredEngines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5A594F]">
                    No engine records matching selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEngines.map(eng => {
                  const isCritical = eng.risk_level === 'CRITICAL';
                  const isWarning = eng.risk_level === 'WARNING';

                  return (
                    <tr key={eng.engine_id} className="hover:bg-[#FAF9F6]">
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] font-bold text-[#16191C]">
                        Engine #{eng.engine_id}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">#{eng.current_cycle}</td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] font-semibold">
                        {eng.predicted_rul} cycles
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3]">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase border ${
                            isCritical
                              ? 'text-[#A6362A] border-[#A6362A]/30 bg-[#A6362A]/10'
                              : isWarning
                              ? 'text-[#B8791A] border-[#B8791A]/30 bg-[#B8791A]/10'
                              : 'text-[#2F6E5C] border-[#2F6E5C]/30 bg-[#2F6E5C]/10'
                          }`}
                        >
                          {eng.risk_level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#DDD8D3] text-[#5A594F] font-sans text-[11px]">
                        {isCritical
                          ? 'Priority Borescope & Module Inspection'
                          : isWarning
                          ? 'Schedule Maintenance within 20 Cycles'
                          : 'Routine Health Monitoring'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEngine(eng)}
                          className="px-2.5 py-1 bg-[#16191C] text-white hover:bg-[#2C3136] text-[10px] font-mono rounded-none cursor-pointer"
                        >
                          Work Order
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Order Modal */}
      {selectedEngine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-6 max-w-xl w-full space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#DDD8D3] pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#16191C]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#16191C]">
                    Work Order WO-ENG-{selectedEngine.engine_id}
                  </h3>
                  <p className="text-[11px] text-[#5A594F]">Turbofan Inspection Dispatch Sheet</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEngine(null)}
                className="text-xs px-2 py-1 bg-[#FAF9F6] border border-[#DDD8D3] text-[#16191C]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF9F6] border border-[#DDD8D3]">
                <div>
                  <span className="text-[#5A594F] block">Unit ID:</span>
                  <span className="text-[#16191C] font-semibold">Engine #{selectedEngine.engine_id}</span>
                </div>
                <div>
                  <span className="text-[#5A594F] block">Current Cycle:</span>
                  <span className="text-[#16191C] font-semibold">#{selectedEngine.current_cycle}</span>
                </div>
                <div>
                  <span className="text-[#5A594F] block">Predicted RUL:</span>
                  <span className="text-[#16191C] font-semibold">{selectedEngine.predicted_rul} cycles</span>
                </div>
                <div>
                  <span className="text-[#5A594F] block">Risk Classification:</span>
                  <span className={`font-semibold ${
                    selectedEngine.risk_level === 'CRITICAL' ? 'text-[#A6362A]' : 'text-[#B8791A]'
                  }`}>
                    {selectedEngine.risk_level}
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#DDD8D3] space-y-2 font-sans">
                <h4 className="font-semibold text-[#16191C] text-xs font-mono uppercase">Technician Action Check-List:</h4>
                <ul className="list-disc list-inside space-y-1 text-[#5A594F] text-xs">
                  <li>Perform optical borescope inspection on HPC & HPT rotor stages.</li>
                  <li>Check combustor fuel flow ratio (sensor_7) and thermal output calibration.</li>
                  <li>Inspect bypass duct acoustic lining seals for micro-fractures.</li>
                  <li>Log physical wear against ML predictions in TurbofanAI database.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDD8D3]">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
