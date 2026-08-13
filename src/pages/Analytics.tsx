import React, { useState, useEffect } from 'react';
import { BarChart2, AlertTriangle, RefreshCw, Activity, Layers, Grid } from 'lucide-react';
import { DatasetMetadata, SensorStats, CorrelationMatrixResponse } from '../types';
import { fetchDatasetAnalysis, runDatasetAnalysis } from '../services/analysisApi';

interface AnalyticsPageProps {
  selectedDataset: DatasetMetadata | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ selectedDataset }) => {
  const [sensorsStats, setSensorsStats] = useState<SensorStats[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'correlation' | 'stats'>('correlation');

  const datasetId = selectedDataset?.dataset_id;

  useEffect(() => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);

    fetchDatasetAnalysis(datasetId)
      .then(res => {
        if (res) {
          setSensorsStats(res.sensors_stats);
          setCorrelation(res.correlation);
        } else {
          return runDatasetAnalysis(datasetId).then(newRes => {
            setSensorsStats(newRes.sensors_stats);
            setCorrelation(newRes.correlation);
          });
        }
      })
      .catch(err => {
        console.error('Failed to load sensor analytics:', err);
        setError('Failed to calculate sensor correlation matrix or statistics.');
      })
      .finally(() => setLoading(false));
  }, [datasetId]);

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
          Upload and validate a dataset in the Dataset workspace before calculating sensor correlations.
        </p>
      </div>
    );
  }

  // Color mapper for Pearson correlation coefficients (-1.0 to +1.0)
  const getCorrColor = (val: number) => {
    if (val === 1) return 'bg-[#16191C] text-white font-bold';
    if (val >= 0.7) return 'bg-[#2F6E5C] text-white font-medium';
    if (val >= 0.4) return 'bg-[#2F6E5C]/30 text-[#16191C]';
    if (val >= 0.1) return 'bg-[#2F6E5C]/10 text-[#16191C]';
    if (val <= -0.7) return 'bg-[#A6362A] text-white font-medium';
    if (val <= -0.4) return 'bg-[#A6362A]/30 text-[#16191C]';
    if (val <= -0.1) return 'bg-[#A6362A]/10 text-[#16191C]';
    return 'bg-[#FAF9F6] text-[#5A594F]';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#DDD8D3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#16191C] text-white rounded-none">
              SENSOR CORRELATION
            </span>
            <span className="text-xs font-mono text-[#5A594F]">{selectedDataset.filename}</span>
          </div>
          <h1 className="text-xl font-semibold text-[#16191C] tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#16191C]" />
            <span>Sensor Trend & Correlation Matrix</span>
          </h1>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Statistical distribution metrics, feature variance, and Pearson correlation coefficients.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 border border-[#DDD8D3]">
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 rounded-none cursor-pointer ${
              activeTab === 'correlation'
                ? 'bg-[#16191C] text-white'
                : 'text-[#5A594F] hover:text-[#16191C]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Correlation Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 rounded-none cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#16191C] text-white'
                : 'text-[#5A594F] hover:text-[#16191C]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sensor Distributions</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#5A594F] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#16191C]" />
          <span>Computing Pearson Correlation Matrix...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-[#A6362A]/10 border border-[#A6362A]/30 text-[#A6362A] text-xs font-mono rounded-sm">
          {error}
        </div>
      ) : activeTab === 'correlation' && correlation ? (
        <div className="space-y-4">
          <div className="bg-[#FAF9F6] border border-[#DDD8D3] p-3 text-xs text-[#5A594F] flex items-center gap-2 font-mono rounded-sm">
            <Activity className="w-4 h-4 shrink-0 text-[#16191C]" />
            <span>Note: Statistical correlation observed in C-MAPSS telemetry dataset.</span>
          </div>

          <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 overflow-x-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDD8D3]">
              <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#16191C]" />
                <span>Pearson Correlation Matrix ({correlation.sensors.length} Active Sensors)</span>
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#5A594F]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#2F6E5C] inline-block"></span> High Positive (+1.0)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FAF9F6] border border-[#DDD8D3] inline-block"></span> Neutral (0.0)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#A6362A] inline-block"></span> High Negative (-1.0)</span>
              </div>
            </div>

            <table className="border-collapse text-[11px] font-mono w-full">
              <thead>
                <tr>
                  <th className="p-2 border border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] text-left">
                    Sensor
                  </th>
                  {correlation.sensors.map(s => (
                    <th key={s} className="p-2 border border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] text-center font-semibold">
                      {s.replace('sensor_', 'S')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.sensors.map((sRow, rIdx) => (
                  <tr key={sRow}>
                    <td className="p-2 border border-[#DDD8D3] font-bold bg-[#FAF9F6] text-[#16191C] text-left whitespace-nowrap">
                      {sRow}
                    </td>
                    {correlation.matrix[rIdx].map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2 border border-[#DDD8D3] text-center transition-colors ${getCorrColor(val)}`}
                        title={`Correlation between ${sRow} and ${correlation.sensors[cIdx]}: ${val}`}
                      >
                        {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'stats' ? (
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 overflow-x-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
            <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#16191C]" />
              <span>Sensor Distribution & Variance Profiles</span>
            </h3>
            <span className="text-xs font-mono text-[#5A594F]">{sensorsStats.length} Total Sensors Evaluated</span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Sensor Name</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Mean Value</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Std Dev (Variance)</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Min Value</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Max Value</th>
                <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Unique Values</th>
                <th className="py-2.5 px-3">Missing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
              {sensorsStats.map(s => (
                <tr key={s.sensor} className="hover:bg-[#FAF9F6]">
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">{s.sensor}</td>
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{s.mean}</td>
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3]">
                    <span className={s.std < 1e-4 ? 'text-[#A6362A] font-semibold' : ''}>
                      {s.std} {s.std < 1e-4 ? '(Constant)' : ''}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{s.min}</td>
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{s.max}</td>
                  <td className="py-2.5 px-3 border-r border-[#DDD8D3]">{s.unique_count}</td>
                  <td className="py-2.5 px-3">{s.missing_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
