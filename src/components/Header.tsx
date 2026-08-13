import React from 'react';
import { Database, Activity, Terminal } from 'lucide-react';
import { DatasetMetadata } from '../types';
import { TurbofanLogo } from './TurbofanLogo';

interface HeaderProps {
  selectedDataset: DatasetMetadata | null;
}

export const Header: React.FC<HeaderProps> = ({ selectedDataset }) => {
  return (
    <header className="border-b border-[#DDD8D3] bg-white sticky top-0 z-30 font-sans select-none">
      {/* Instrumentation Status Bar */}
      <div className="bg-[#14171A] text-[#FAF9F6] text-[11px] px-6 py-1 flex items-center justify-between border-b border-[#23272B] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-[#2F6E5C]" />
            <span className="text-[#DDD8D3] uppercase tracking-wider text-[10px]">TELEMETRY STREAM:</span>
            <span className="text-[#2F6E5C] font-semibold text-[10px]">100 Hz ONLINE</span>
          </div>
          <span className="text-[#5A594F]">|</span>
          <span className="text-[#5A594F]">C-MAPSS FD001 VALIDATED</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[#8C8B80] text-[10px]">
          <span>MRO MAINTENANCE CONSOLE</span>
          <span>•</span>
          <span>PROTOCOL: HERMES AI READ-ONLY</span>
        </div>
      </div>

      <div className="h-14 px-6 flex items-center justify-between gap-4">
        {/* TurbofanAI Brand Section */}
        <div className="flex items-center gap-4 shrink-0">
          <TurbofanLogo size={26} showWordmark={true} />
          <div className="hidden md:block h-5 w-px bg-[#DDD8D3]" />
          <div className="hidden md:flex items-center gap-2 text-xs text-[#5A594F]">
            <span className="font-mono text-[#16191C] font-medium">NASA GRC TELEMETRY PLATFORM</span>
          </div>
        </div>

        {/* Header Right Status & Dataset Chips */}
        <div className="flex items-center gap-3">
          {/* Dataset Status Chip */}
          {selectedDataset ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-[#DDD8D3] text-xs font-mono rounded-none">
              <Database className="w-3.5 h-3.5 text-[#5A594F]" />
              <span className="font-medium text-[#16191C] max-w-[140px] truncate text-[11px]">
                {selectedDataset.filename}
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase border ${
                  selectedDataset.status === 'VALID'
                    ? 'text-[#2F6E5C] border-[#2F6E5C]/30 bg-[#2F6E5C]/10'
                    : selectedDataset.status === 'WARNING'
                    ? 'text-[#B8791A] border-[#B8791A]/30 bg-[#B8791A]/10'
                    : 'text-[#A6362A] border-[#A6362A]/30 bg-[#A6362A]/10'
                }`}
              >
                {selectedDataset.status}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-[#DDD8D3] text-xs text-[#5A594F] font-mono rounded-none">
              <Activity className="w-3.5 h-3.5 text-[#2F6E5C]" />
              <span className="text-[11px]">SAMPLE_FD001.TXT READY</span>
            </div>
          )}

          {/* Console Mode Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD8D3] font-mono text-[11px] text-[#5A594F] rounded-none">
            <Terminal className="w-3.5 h-3.5 text-[#16191C]" />
            <span>HERMES AGENT: </span>
            <span className="text-[#2F6E5C] font-semibold">ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
