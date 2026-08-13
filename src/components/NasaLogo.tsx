import React from 'react';

interface NasaLogoProps {
  className?: string;
  variant?: 'meatball' | 'worm' | 'badge';
  size?: 'sm' | 'md' | 'lg';
}

export const NasaLogo: React.FC<NasaLogoProps> = ({
  className = '',
  variant = 'meatball',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  if (variant === 'worm') {
    return (
      <div className={`font-black tracking-tighter text-[#FC3D21] select-none flex items-center font-mono ${className}`}>
        <span className="text-xl tracking-[0.2em]">N A S A</span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B3D91]/15 text-[#0B3D91] dark:text-sky-300 border border-[#0B3D91]/30 text-xs font-semibold ${className}`}>
        <NasaLogo size="sm" variant="meatball" />
        <span className="font-mono text-[11px] tracking-wide">NASA GLENN RESEARCH CENTER</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block shrink-0 ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* NASA Meatball Globe */}
        <circle cx="50" cy="50" r="46" fill="#0B3D91" />
        
        {/* Orbit Ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="18"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          transform="rotate(-28 50 50)"
          opacity="0.9"
        />

        {/* Stars */}
        <circle cx="28" cy="28" r="1.5" fill="#FFFFFF" />
        <circle cx="36" cy="20" r="1.2" fill="#FFFFFF" />
        <circle cx="72" cy="24" r="1.5" fill="#FFFFFF" />
        <circle cx="80" cy="38" r="1.2" fill="#FFFFFF" />
        <circle cx="22" cy="62" r="1.2" fill="#FFFFFF" />
        <circle cx="32" cy="74" r="1.5" fill="#FFFFFF" />
        <circle cx="76" cy="70" r="1.2" fill="#FFFFFF" />

        {/* Red Vector Wing */}
        <path
          d="M 12,78 C 30,58 65,30 92,18 C 76,38 48,64 26,84 C 20,86 14,82 12,78 Z"
          fill="#FC3D21"
        />

        {/* NASA Text */}
        <text
          x="50"
          y="58"
          fill="#FFFFFF"
          fontSize="23"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          NASA
        </text>
      </svg>
    </div>
  );
};
