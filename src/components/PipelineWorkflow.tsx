import React from 'react';
import { Database, CheckCircle2, BarChart3, TrendingUp, Bot, FileCheck, ArrowRight } from 'lucide-react';

export const PipelineWorkflow: React.FC = () => {
  const steps = [
    {
      id: 'dataset',
      title: 'DATASET',
      subtitle: 'Upload & Parse',
      icon: Database,
      tag: 'READY'
    },
    {
      id: 'validation',
      title: 'VALIDATION',
      subtitle: 'Quality Checks',
      icon: CheckCircle2,
      tag: 'READY'
    },
    {
      id: 'analysis',
      title: 'ANALYSIS',
      subtitle: 'Sensor Trends',
      icon: BarChart3,
      tag: 'READY'
    },
    {
      id: 'rul',
      title: 'RUL ENGINE',
      subtitle: 'ML Modeling',
      icon: TrendingUp,
      tag: 'READY'
    },
    {
      id: 'hermes',
      title: 'HERMES AGENT',
      subtitle: 'Engine Insights',
      icon: Bot,
      tag: 'READY'
    },
    {
      id: 'insights',
      title: 'REPORTS',
      subtitle: 'Fleet Analytics',
      icon: FileCheck,
      tag: 'READY'
    }
  ];

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D3]">
        <div>
          <h3 className="text-sm font-semibold text-[#16191C]">
            Predictive Propulsion Pipeline Architecture
          </h3>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            End-to-end data ingestion, 21-sensor profiling, machine learning RUL, and Hermes AI agent reasoning.
          </p>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#FAF9F6] text-[#16191C] border border-[#DDD8D3]">
          FD001 PROTOCOL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex flex-col justify-between">
              <div className="p-3.5 rounded-sm border border-[#DDD8D3] bg-[#FAF9F6] text-[#16191C] h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 rounded-none flex items-center justify-center bg-white border border-[#DDD8D3] text-[#16191C]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono px-1 py-0.2 font-semibold uppercase bg-[#2F6E5C]/10 text-[#2F6E5C] border border-[#2F6E5C]/30">
                    {step.tag}
                  </span>
                </div>

                <p className="font-mono text-xs font-semibold uppercase mb-0.5 text-[#16191C]">{step.title}</p>
                <p className="text-[11px] text-[#5A594F] font-sans">{step.subtitle}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#5A594F] pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
