import React from 'react';
import { Database, Cpu, Layers, Activity, Clock, CheckCircle } from 'lucide-react';
import { DatasetMetadata } from '../types';

interface DatasetSummaryProps {
  metadata: DatasetMetadata;
}

export const DatasetSummaryCard: React.FC<DatasetSummaryProps> = ({ metadata }) => {
  const { summary, dataset_format, status, filename, file_size_bytes } = metadata;

  const metrics = [
    {
      label: 'TOTAL ROWS',
      value: summary.rows.toLocaleString(),
      icon: Database,
      desc: 'Observed engine cycle records'
    },
    {
      label: 'ENGINE UNITS',
      value: summary.engines.toLocaleString(),
      icon: Cpu,
      desc: 'Tracked engine IDs'
    },
    {
      label: 'SENSORS',
      value: `${summary.sensors} Sensors`,
      icon: Activity,
      desc: 'Operational sensors & settings'
    },
    {
      label: 'ATTRIBUTES',
      value: summary.columns.toString(),
      icon: Layers,
      desc: 'Header column fields'
    },
    {
      label: 'MIN CYCLE',
      value: summary.min_cycle.toString(),
      icon: Clock,
      desc: 'Initial recorded cycle'
    },
    {
      label: 'MAX CYCLE',
      value: summary.max_cycle.toString(),
      icon: Clock,
      desc: 'Max operational cycle'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD8D3]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-[#16191C] font-mono">
              {filename}
            </h3>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase border ${
                status === 'VALID'
                  ? 'text-[#2F6E5C] border-[#2F6E5C]/30 bg-[#2F6E5C]/10'
                  : status === 'WARNING'
                  ? 'text-[#B8791A] border-[#B8791A]/30 bg-[#B8791A]/10'
                  : 'text-[#A6362A] border-[#A6362A]/30 bg-[#A6362A]/10'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-[#5A594F] mt-1 font-mono">
            Format: <strong className="text-[#16191C]">{dataset_format}</strong> • Size: {formatFileSize(file_size_bytes)} • Dataset ID: <span className="font-semibold text-[#16191C]">{metadata.dataset_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#2F6E5C] font-mono bg-[#2F6E5C]/10 px-3 py-1 border border-[#2F6E5C]/30 rounded-none self-start sm:self-auto">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>DATA PARSING VERIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-medium text-[#5A594F] uppercase">
                    {m.label}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[#5A594F]" />
                </div>
                <p className="text-base font-semibold font-mono text-[#16191C]">
                  {m.value}
                </p>
              </div>
              <p className="text-[10px] text-[#5A594F] mt-2 font-sans truncate">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
