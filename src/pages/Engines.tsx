import React, { useState, useEffect } from 'react';
import { Cpu, AlertTriangle, Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';
import { DatasetMetadata, EngineDetailResponse, EnginePredictionResult } from '../types';
import { fetchEngineDetail } from '../services/analysisApi';
import { fetchPredictionResults } from '../services/predictionApi';
import { RulGaugeBar } from '../components/RulGaugeBar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnginesPageProps {
  selectedDataset: DatasetMetadata | null;
}

export const EnginesPage: React.FC<EnginesPageProps> = ({ selectedDataset }) => {
  const [selectedEngineId, setSelectedEngineId] = useState<number>(1);
  const [selectedSensor, setSelectedSensor] = useState<string>('sensor_7');
  const [engineDetail, setEngineDetail] = useState<EngineDetailResponse | null>(null);
  const [enginePrediction, setEnginePrediction] = useState<EnginePredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const datasetId = selectedDataset?.dataset_id;
  const totalEngines = selectedDataset?.summary.engines || 0;

  useEffect(() => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchEngineDetail(datasetId, selectedEngineId),
      fetchPredictionResults(datasetId)
    ])
      .then(([detail, predRes]) => {
        setEngineDetail(detail);
        if (predRes && predRes.predictions) {
          const match = predRes.predictions.find(p => p.engine_id === selectedEngineId);
          setEnginePrediction(match || null);
        } else {
          setEnginePrediction(null);
        }
      })
      .catch(err => {
        console.error('Failed to load engine details:', err);
        setError('Failed to load engine telemetry data.');
      })
      .finally(() => setLoading(false));
  }, [datasetId, selectedEngineId]);

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
          Upload and validate a dataset in the Dataset workspace before analyzing engine degradation trajectories.
        </p>
      </div>
    );
  }

  const engineList = Array.from({ length: totalEngines }, (_, i) => i + 1);
  const availableSensors = engineDetail?.sensors_available || [];

  const chartData = engineDetail?.cycles.map(c => ({
    cycle: c.cycle,
    value: c[selectedSensor] !== null && c[selectedSensor] !== undefined ? Number(c[selectedSensor]) : null
  })) || [];

  const initVal = engineDetail?.degradation_summary.initial_values[selectedSensor];
  const finalVal = engineDetail?.degradation_summary.final_values[selectedSensor];
  const pctChange = engineDetail?.degradation_summary.pct_changes[selectedSensor] || 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#DDD8D3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#16191C] text-white rounded-none">
              ENGINE TELEMETRY
            </span>
            <span className="text-xs font-mono text-[#5A594F]">{selectedDataset.filename}</span>
          </div>
          <h1 className="text-xl font-semibold text-[#16191C] tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#16191C]" />
            <span>Engine Unit Analytics & Trajectories</span>
          </h1>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Individual turbofan unit degradation trajectories, cycle counts, and RUL degradation indicators.
          </p>
        </div>

        {/* Engine and Sensor Selectors */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">
              Engine Unit ID
            </label>
            <select
              value={selectedEngineId}
              onChange={e => setSelectedEngineId(Number(e.target.value))}
              className="bg-white border border-[#DDD8D3] text-[#16191C] text-xs px-3 py-1.5 font-mono rounded-none focus:outline-none focus:border-[#16191C]"
            >
              {engineList.map(id => (
                <option key={id} value={id}>
                  Engine #{id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#5A594F] mb-1">
              Sensor Channel
            </label>
            <select
              value={selectedSensor}
              onChange={e => setSelectedSensor(e.target.value)}
              className="bg-white border border-[#DDD8D3] text-[#16191C] text-xs px-3 py-1.5 font-mono rounded-none focus:outline-none focus:border-[#16191C]"
            >
              {availableSensors.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#5A594F] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#16191C]" />
          <span>Loading Engine #{selectedEngineId} Telemetry...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-[#A6362A]/10 border border-[#A6362A]/30 text-[#A6362A] text-xs font-mono rounded-sm">
          {error}
        </div>
      ) : engineDetail ? (
        <div className="space-y-6">
          {/* Engine Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#DDD8D3] rounded-sm p-4">
              <span className="text-[10px] font-mono uppercase text-[#5A594F]">Unit Designation</span>
              <p className="text-xl font-semibold font-mono text-[#16191C] mt-1">
                Engine #{selectedEngineId}
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-4">
              <span className="text-[10px] font-mono uppercase text-[#5A594F]">Observed Cycles</span>
              <p className="text-xl font-semibold font-mono text-[#16191C] mt-1">
                {engineDetail.total_cycles} cycles
              </p>
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-4">
              <span className="text-[10px] font-mono uppercase text-[#5A594F]">Remaining Useful Life</span>
              {enginePrediction ? (
                <div className="mt-1 space-y-1">
                  <RulGaugeBar currentRul={enginePrediction.predicted_rul} riskStatus={enginePrediction.risk_level} />
                </div>
              ) : (
                <p className="text-xs text-[#5A594F] font-mono mt-2">Prediction pending</p>
              )}
            </div>

            <div className="bg-white border border-[#DDD8D3] rounded-sm p-4">
              <span className="text-[10px] font-mono uppercase text-[#5A594F]">{selectedSensor} Trend</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-semibold font-mono text-[#16191C]">
                  {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`}
                </span>
                {pctChange >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-[#B8791A]" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-[#2F6E5C]" />
                )}
              </div>
            </div>
          </div>

          {/* Sensor Degradation Trajectory Chart */}
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDD8D3]">
              <div>
                <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#A6362A]" />
                  <span>Telemetry Trajectory: {selectedSensor}</span>
                </h3>
                <p className="text-xs text-[#5A594F] font-mono mt-0.5">
                  Observed sensor output over operational cycle history.
                </p>
              </div>

              <div className="text-right font-mono text-xs text-[#5A594F]">
                <span>INITIAL: <strong className="text-[#16191C]">{initVal}</strong></span>
                <span className="mx-2">→</span>
                <span>FINAL: <strong className="text-[#16191C]">{finalVal}</strong></span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD8D3" />
                  <XAxis dataKey="cycle" stroke="#5A594F" fontSize={10} tickLine={false} label={{ value: 'OPERATING CYCLE', position: 'insideBottom', offset: -5, fill: '#5A594F', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis stroke="#5A594F" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
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
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={selectedSensor}
                    stroke="#16191C"
                    strokeWidth={1.5}
                    dot={{ r: 1, fill: '#16191C' }}
                    activeDot={{ r: 3, fill: '#A6362A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Cycle Telemetry Table */}
          <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
              <h3 className="text-sm font-semibold text-[#16191C] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#16191C]" />
                <span>Recent Cycle Telemetry Records (Engine #{selectedEngineId})</span>
              </h3>
              <span className="text-xs font-mono text-[#5A594F]">Last 10 observations</span>
            </div>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3]">Cycle</th>
                    {availableSensors.slice(0, 8).map(s => (
                      <th key={s} className="py-2.5 px-3 border-r border-[#DDD8D3]">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  {engineDetail.cycles.slice(-10).map((cRow, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF9F6]">
                      <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">#{cRow.cycle}</td>
                      {availableSensors.slice(0, 8).map(s => (
                        <td key={s} className="py-2 px-3 border-r border-[#DDD8D3]">
                          {cRow[s] !== null && cRow[s] !== undefined ? Number(cRow[s]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
