import React from 'react';

interface RulGaugeBarProps {
  currentRul: number;
  maxRul?: number;
  riskStatus?: 'CRITICAL' | 'WARNING' | 'HEALTHY' | string;
  showText?: boolean;
  className?: string;
}

export const RulGaugeBar: React.FC<RulGaugeBarProps> = ({
  currentRul,
  maxRul = 150,
  riskStatus,
  showText = true,
  className = ''
}) => {
  // Normalize percentage of life remaining (0..100)
  const remainingPct = Math.max(0, Math.min(100, Math.round((currentRul / maxRul) * 100)));
  
  // Calculate degradation (how much life has been consumed / how little life is left)
  // Higher degradation = higher critical red fill
  const degradationPct = 100 - remainingPct;

  // Determine status color if not explicitly provided
  let strokeColor = '#2F6E5C'; // Healthy default
  let textClass = 'text-[#2F6E5C]';
  
  if (riskStatus === 'CRITICAL' || currentRul <= 30) {
    strokeColor = '#A6362A';
    textClass = 'text-[#A6362A] font-semibold';
  } else if (riskStatus === 'WARNING' || currentRul <= 70) {
    strokeColor = '#B8791A';
    textClass = 'text-[#B8791A]';
  }

  return (
    <div className={`inline-flex items-center gap-2.5 w-full ${className}`}>
      {/* Horizontal degradation gauge bar */}
      <div className="flex-1 h-2 bg-[#DDD8D3]/50 border border-[#DDD8D3] rounded-none overflow-hidden relative">
        {/* Fill representing degradation / life consumed in Critical Red (#A6362A) or Status Color */}
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${degradationPct}%`,
            backgroundColor: strokeColor
          }}
        />
        {/* Subtle tick markers at 25%, 50%, 75% */}
        <div className="absolute inset-0 flex justify-between px-0 pointer-events-none opacity-30">
          <div className="w-[1px] h-full bg-[#16191C] ml-[25%]" />
          <div className="w-[1px] h-full bg-[#16191C] ml-[25%]" />
          <div className="w-[1px] h-full bg-[#16191C] ml-[25%]" />
        </div>
      </div>

      {showText && (
        <span className={`font-mono text-xs whitespace-nowrap min-w-[54px] text-right ${textClass}`}>
          {currentRul} cycles
        </span>
      )}
    </div>
  );
};
