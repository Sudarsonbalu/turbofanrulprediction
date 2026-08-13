import React from 'react';
import { DatasetPreviewResponse } from '../types';
import { Table, Eye } from 'lucide-react';

interface DatasetTableProps {
  previewData: DatasetPreviewResponse | null;
  isLoading: boolean;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ previewData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#DDD8D3] rounded-sm p-8 text-center">
        <div className="inline-block w-5 h-5 border-2 border-[#16191C] border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-mono text-[#5A594F]">Loading telemetry preview from server...</p>
      </div>
    );
  }

  if (!previewData || previewData.rows.length === 0) {
    return (
      <div className="bg-white border border-[#DDD8D3] rounded-sm p-8 text-center text-[#5A594F] font-mono text-xs">
        <Table className="w-6 h-6 text-[#5A594F] mx-auto mb-2" />
        <p>No preview rows available for this dataset.</p>
      </div>
    );
  }

  const { columns, rows, total_rows, preview_rows_count } = previewData;

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDD8D3]">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#16191C]" />
          <h3 className="text-sm font-semibold text-[#16191C] font-sans">
            Raw Telemetry Data Preview (First {preview_rows_count} Rows)
          </h3>
        </div>

        <div className="text-xs font-mono text-[#5A594F]">
          Displaying 1–{preview_rows_count} of {total_rows.toLocaleString()} observations
        </div>
      </div>

      <div className="overflow-x-auto border border-[#DDD8D3] max-h-[460px] overflow-y-auto rounded-none">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-[#FAF9F6] sticky top-0 z-10 border-b border-[#DDD8D3] text-[#5A594F] font-medium whitespace-nowrap">
            <tr>
              <th className="py-2.5 px-3 border-r border-[#DDD8D3] text-center w-12 bg-[#FAF9F6]">#</th>
              {columns.map(col => (
                <th
                  key={col}
                  className={`py-2.5 px-3 border-r border-[#DDD8D3] uppercase tracking-wider text-[11px] ${
                    col === 'engine_id'
                      ? 'bg-[#16191C] text-white font-semibold'
                      : col === 'cycle'
                      ? 'bg-[#16191C] text-white font-semibold'
                      : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C] whitespace-nowrap">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#FAF9F6] transition-colors">
                <td className="py-2 px-3 text-center text-[#5A594F] border-r border-[#DDD8D3] text-[11px]">
                  {rowIdx + 1}
                </td>
                {columns.map(col => {
                  const val = row[col];
                  const isEngine = col === 'engine_id';
                  const isCycle = col === 'cycle';

                  return (
                    <td
                      key={col}
                      className={`py-2 px-3 border-r border-[#DDD8D3] ${
                        isEngine ? 'font-semibold text-[#16191C] bg-[#FAF9F6]' : ''
                      } ${isCycle ? 'font-medium text-[#16191C]' : ''}`}
                    >
                      {val === null || val === undefined ? (
                        <span className="text-[#A6362A] font-semibold text-[10px]">NULL</span>
                      ) : (
                        typeof val === 'number' ? val : String(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
