import React from 'react';

interface TurbofanLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export const TurbofanLogo: React.FC<TurbofanLogoProps> = ({
  size = 28,
  showWordmark = true,
  className = '',
  wordmarkClassName = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="TurbofanAI Logo Mark"
      >
        {/* Circle dial housing (28% stroke opacity) */}
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="#16191C"
          strokeWidth="1.75"
          strokeOpacity="0.28"
        />

        {/* Outer tick marks at cardinal positions */}
        <line x1="16" y1="3" x2="16" y2="5" stroke="#16191C" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="29" y1="16" x2="27" y2="16" stroke="#16191C" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="16" y1="29" x2="16" y2="27" stroke="#16191C" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="3" y1="16" x2="5" y2="16" stroke="#16191C" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Degradation Arc in Critical Red (#A6362A) covering top-right quadrant (from 12 o'clock to 3 o'clock) */}
        <path
          d="M 16 3 A 13 13 0 0 1 29 16"
          fill="none"
          stroke="#A6362A"
          strokeWidth="2.5"
          strokeLinecap="square"
        />

        {/* Needle pointing from center to top (12 o'clock) */}
        <line
          x1="16"
          y1="16"
          x2="16"
          y2="6"
          stroke="#A6362A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Filled center hub dot */}
        <circle cx="16" cy="16" r="2.75" fill="#16191C" />
        <circle cx="16" cy="16" r="1" fill="#FFFFFF" />
      </svg>

      {showWordmark && (
        <span className={`font-sans font-semibold tracking-tight text-lg leading-none ${wordmarkClassName}`}>
          <span className="text-[#16191C]">Turbofan</span>
          <span className="text-[#A6362A]">AI</span>
        </span>
      )}
    </div>
  );
};
