import React from 'react';
import { Check, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { DataQualityReport } from '../types';

interface DataQualityProps {
  quality: DataQualityReport;
}

export const DataQualityCard: React.FC<DataQualityProps> = ({ quality }) => {
  const qualityItems = [
    {
      label: 'MISSING VALUES',
      value: quality.missing_values,
      isValid: quality.missing_values === 0,
      desc: 'Blank or unparsed fields'
    },
    {
      label: 'DUPLICATE ROWS',
      value: quality.duplicate_rows,
      isValid: quality.duplicate_rows === 0,
      desc: 'Repeated engine/cycle entries'
    },
    {
      label: 'INVALID VALUES',
      value: quality.invalid_values,
      isValid: quality.invalid_values === 0,
      desc: 'Non-positive or invalid cycle'
    },
    {
      label: 'NAN VALUES',
      value: quality.nan_values,
      isValid: quality.nan_values === 0,
      desc: 'Numerical NaN data points'
    },
    {
      label: 'INFINITE VALUES',
      value: quality.infinite_values,
      isValid: quality.infinite_values === 0,
      desc: 'Inf numerical overflow'
    },
    {
      label: 'NUMERIC SENSORS',
      value: quality.numeric_sensors_status,
      isValid: quality.is_sensors_valid,
      desc: 'Sensor channel consistency'
    }
  ];

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16191C]" />
          <h3 className="text-sm font-semibold text-[#16191C]">
            Data Quality & Integrity Inspector
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#5A594F]">
          PARSER VERIFICATION
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {qualityItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-[#16191C] font-mono">{item.label}</p>
              <p className="text-[10px] text-[#5A594F] mt-0.5">{item.desc}</p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold shrink-0 ml-3">
              {item.isValid ? (
                <span className="inline-flex items-center gap-1 text-[#2F6E5C] bg-[#2F6E5C]/10 px-2 py-0.5 border border-[#2F6E5C]/30 rounded-none">
                  <Check className="w-3.5 h-3.5" />
                  <span>{typeof item.value === 'number' ? `${item.value}` : item.value}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#B8791A] bg-[#B8791A]/10 px-2 py-0.5 border border-[#B8791A]/30 rounded-none">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{typeof item.value === 'number' ? `${item.value}` : item.value}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {quality.issues.length > 0 && (
        <div className="p-3 bg-[#B8791A]/10 border border-[#B8791A]/30 text-xs text-[#B8791A] space-y-1 rounded-sm font-mono">
          <div className="flex items-center gap-1.5 font-semibold text-[#B8791A]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Inspection Warnings Identified:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
            {quality.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
