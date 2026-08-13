import React, { useState } from 'react';
import { ColumnProfile } from '../types';
import { Search, Hash, Text, Binary } from 'lucide-react';

interface DatasetProfileProps {
  columnsProfile: ColumnProfile[];
}

export const DatasetProfileTable: React.FC<DatasetProfileProps> = ({ columnsProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredColumns = columnsProfile.filter(col => {
    const matchesSearch = col.column.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || col.data_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: ColumnProfile['data_type']) => {
    switch (type) {
      case 'integer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#DDD8D3] bg-[#FAF9F6] text-[#16191C] font-mono text-[10px]">
            <Hash className="w-3 h-3" /> INT
          </span>
        );
      case 'float':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#DDD8D3] bg-[#FAF9F6] text-[#16191C] font-mono text-[10px]">
            <Binary className="w-3 h-3" /> FLOAT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] font-mono text-[10px]">
            <Text className="w-3 h-3" /> STR
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD8D3]">
        <div>
          <h3 className="text-sm font-semibold text-[#16191C]">
            Column Profiling & Statistical Distribution
          </h3>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Statistical range, completeness, and data types computed from active telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5A594F] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search column..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 border border-[#DDD8D3] bg-[#FAF9F6] text-xs font-mono text-[#16191C] rounded-none focus:outline-none focus:border-[#16191C] w-40 sm:w-48"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1 border border-[#DDD8D3] bg-[#FAF9F6] text-xs font-mono text-[#16191C] rounded-none focus:outline-none focus:border-[#16191C]"
          >
            <option value="all">All Types</option>
            <option value="integer">Integer</option>
            <option value="float">Float</option>
            <option value="string">String</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#DDD8D3] max-h-80 overflow-y-auto rounded-none">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-[#FAF9F6] sticky top-0 z-10 border-b border-[#DDD8D3] text-[#5A594F] font-medium uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Column Name</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-right">Non-Null</th>
              <th className="py-2.5 px-4 text-right">Unique</th>
              <th className="py-2.5 px-4 text-right">Min</th>
              <th className="py-2.5 px-4 text-right">Max</th>
              <th className="py-2.5 px-4 text-right">Mean</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
            {filteredColumns.map(col => (
              <tr key={col.column} className="hover:bg-[#FAF9F6] transition-colors">
                <td className="py-2 px-4 font-semibold text-[#16191C]">{col.column}</td>
                <td className="py-2 px-4">{getTypeBadge(col.data_type)}</td>
                <td className="py-2 px-4 text-right">{col.non_null_count.toLocaleString()}</td>
                <td className="py-2 px-4 text-right">{col.unique_count.toLocaleString()}</td>
                <td className="py-2 px-4 text-right">{col.min_value !== undefined ? col.min_value : '—'}</td>
                <td className="py-2 px-4 text-right">{col.max_value !== undefined ? col.max_value : '—'}</td>
                <td className="py-2 px-4 text-right">{col.mean_value !== undefined ? col.mean_value : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
