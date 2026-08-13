import React from 'react';
import { Lock, ArrowRight, Shield } from 'lucide-react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  phaseName: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ title, description, phaseName }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-sky-500" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 mb-3">
        <Shield className="w-3.5 h-3.5 text-sky-500" />
        <span>Available in a future analysis phase</span>
      </span>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans">
        {title}
      </h2>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
        {description}
      </p>

      <div className="mt-8 p-4 max-w-md mx-auto rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-left font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-800 pb-2">
          <span>Target Milestone</span>
          <span className="text-sky-600 dark:text-sky-400">{phaseName}</span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Phase 1 provides complete raw dataset upload, C-MAPSS / CSV parsing, structure validation, and profiling. This module will activate when model execution or agent tools are configured.
        </p>
      </div>
    </div>
  );
};
