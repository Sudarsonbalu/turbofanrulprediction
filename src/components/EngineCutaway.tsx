import React from 'react';

interface EngineCutawayProps {
  className?: string;
}

export const EngineCutaway: React.FC<EngineCutawayProps> = ({ className = '' }) => {
  return (
    <div className={`w-full bg-white border border-[#DDD8D3] p-4 sm:p-6 rounded-sm relative overflow-hidden ${className}`}>
      {/* Instrumentation Header tag */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#DDD8D3]/60">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#5A594F]">
          FIG 1.0 — DUAL-SPOOL TURBOFAN ENGINE CUTAWAY TELEMETRY DIAGRAM
        </span>
        <span className="font-mono text-[10px] text-[#A6362A] bg-[#A6362A]/10 border border-[#A6362A]/30 px-1.5 py-0.5">
          T48 COMBUSTOR THERMAL ZONE
        </span>
      </div>

      <svg
        viewBox="0 0 680 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto select-none"
      >
        {/* Background Grid Lines (Engine instrumentation style) */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DDD8D3" strokeWidth="0.5" strokeOpacity="0.4" />
        </pattern>
        <rect width="680" height="320" fill="url(#grid)" />

        {/* Centerline Axis */}
        <line x1="40" y1="185" x2="640" y2="185" stroke="#16191C" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.3" />
        <text x="45" y="198" fill="#5A594F" fontSize="9" fontFamily="IBM Plex Mono">ENGINE CENTERLINE (CL)</text>

        {/* ========================================== */}
        {/* LEADER LINES & LABELS (TOP) */}
        {/* ========================================== */}
        
        {/* 1. FAN STAGE */}
        <line x1="115" y1="65" x2="115" y2="105" stroke="#5A594F" strokeWidth="1" />
        <circle cx="115" cy="105" r="2" fill="#5A594F" />
        <text x="115" y="55" fill="#5A594F" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="500" textAnchor="middle">
          FAN STAGE
        </text>

        {/* 2. HP COMPRESSOR */}
        <line x1="250" y1="65" x2="250" y2="135" stroke="#5A594F" strokeWidth="1" />
        <circle cx="250" cy="135" r="2" fill="#5A594F" />
        <text x="250" y="55" fill="#5A594F" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="500" textAnchor="middle">
          HP COMPRESSOR
        </text>

        {/* 3. COMBUSTOR (Critical Red Highlight) */}
        <line x1="385" y1="65" x2="385" y2="148" stroke="#A6362A" strokeWidth="1.25" />
        <circle cx="385" cy="148" r="2.5" fill="#A6362A" />
        <text x="385" y="55" fill="#A6362A" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="600" textAnchor="middle">
          COMBUSTOR (T48)
        </text>

        {/* 4. TURBINE STAGE */}
        <line x1="490" y1="65" x2="490" y2="142" stroke="#5A594F" strokeWidth="1" />
        <circle cx="490" cy="142" r="2" fill="#5A594F" />
        <text x="490" y="55" fill="#5A594F" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="500" textAnchor="middle">
          HP/LP TURBINE
        </text>

        {/* 5. EXHAUST NOZZLE */}
        <line x1="575" y1="65" x2="575" y2="152" stroke="#5A594F" strokeWidth="1" />
        <circle cx="575" cy="152" r="2" fill="#5A594F" />
        <text x="575" y="55" fill="#5A594F" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="500" textAnchor="middle">
          EXHAUST NOZZLE
        </text>


        {/* ========================================== */}
        {/* ENGINE CUTAWAY STRUCTURE */}
        {/* ========================================== */}

        {/* Outer Nacelle Housing Outline (Top & Bottom) */}
        <path
          d="M 50 115 L 175 110 L 320 132 L 440 132 L 530 142 L 590 155 L 610 162"
          fill="none"
          stroke="#16191C"
          strokeWidth="1.75"
        />
        <path
          d="M 50 255 L 175 260 L 320 238 L 440 238 L 530 228 L 590 215 L 610 208"
          fill="none"
          stroke="#16191C"
          strokeWidth="1.75"
        />

        {/* Inlet Lip Contour */}
        <path d="M 50 115 C 40 130 40 240 50 255" fill="none" stroke="#16191C" strokeWidth="1.75" />

        {/* Bypass Duct Inner Casing Line */}
        <path d="M 175 138 L 320 148 L 440 148 L 530 158 L 590 168" fill="none" stroke="#16191C" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 175 232 L 320 222 L 440 222 L 530 212 L 590 202" fill="none" stroke="#16191C" strokeWidth="1" strokeDasharray="3 3" />

        {/* Central Shaft (High Pressure & Low Pressure Spools) */}
        <rect x="100" y="181" width="460" height="8" fill="#FFFFFF" stroke="#16191C" strokeWidth="1.25" />
        <line x1="100" y1="185" x2="560" y2="185" stroke="#16191C" strokeWidth="1" />

        {/* ------------------------------------------ */}
        {/* 1. FAN BLADES (Radiating from central hub) */}
        {/* ------------------------------------------ */}
        <ellipse cx="100" cy="185" rx="16" ry="60" fill="#FFFFFF" stroke="#16191C" strokeWidth="1.5" />
        
        {/* Radiating Fan Blades */}
        {[ -50, -38, -25, -12, 12, 25, 38, 50 ].map((offset, i) => (
          <line key={`fan-blade-${i}`} x1="100" y1="185" x2="108" y2={185 + offset} stroke="#16191C" strokeWidth="1.75" />
        ))}
        {/* Spinner Cone */}
        <path d="M 70 185 L 100 162 L 100 208 Z" fill="#FFFFFF" stroke="#16191C" strokeWidth="1.5" />

        {/* ------------------------------------------ */}
        {/* 2. COMPRESSOR STAGES (Tapering verticals)  */}
        {/* ------------------------------------------ */}
        {[ 185, 205, 225, 245, 265, 285, 305 ].map((xPos, idx) => {
          const height = 44 - idx * 4.5;
          return (
            <g key={`comp-stage-${idx}`}>
              <line x1={xPos} y1={185 - height} x2={xPos} y2={185 + height} stroke="#16191C" strokeWidth="1.5" />
              {/* Stator Vanes */}
              <line x1={xPos + 8} y1={185 - height + 2} x2={xPos + 8} y2={185 + height - 2} stroke="#5A594F" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          );
        })}

        {/* ------------------------------------------ */}
        {/* 3. COMBUSTOR STAGE (CRITICAL RED TINT & OUTLINE) */}
        {/* ------------------------------------------ */}
        {/* Upper Combustor Chamber Ellipse */}
        <ellipse
          cx="385"
          cy="158"
          rx="42"
          ry="15"
          fill="rgba(166, 54, 42, 0.15)"
          stroke="#A6362A"
          strokeWidth="1.75"
        />
        {/* Lower Combustor Chamber Ellipse */}
        <ellipse
          cx="385"
          cy="212"
          rx="42"
          ry="15"
          fill="rgba(166, 54, 42, 0.15)"
          stroke="#A6362A"
          strokeWidth="1.75"
        />

        {/* Fuel Injectors & Igniter Flame Vectors */}
        <path d="M 355 158 Q 385 152 415 158" stroke="#A6362A" strokeWidth="1.25" fill="none" />
        <path d="M 355 212 Q 385 218 415 212" stroke="#A6362A" strokeWidth="1.25" fill="none" />
        
        <circle cx="385" cy="158" r="3" fill="#A6362A" />
        <circle cx="385" cy="212" r="3" fill="#A6362A" />

        {/* ------------------------------------------ */}
        {/* 4. TURBINE STAGES (Expanding vertical lines)*/}
        {/* ------------------------------------------ */}
        {[ 450, 475, 500, 525 ].map((xPos, idx) => {
          const height = 24 + idx * 5;
          return (
            <g key={`turb-stage-${idx}`}>
              <line x1={xPos} y1={185 - height} x2={xPos} y2={185 + height} stroke="#16191C" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* ------------------------------------------ */}
        {/* 5. EXHAUST NOZZLE & TRAIL                  */}
        {/* ------------------------------------------ */}
        {/* Tail Cone Plug */}
        <path d="M 560 181 L 620 185 L 560 189 Z" fill="#16191C" stroke="#16191C" strokeWidth="1" />

        {/* Exhaust Jet Plume Lines (Dashed) */}
        <line x1="610" y1="168" x2="665" y2="162" stroke="#A6362A" strokeWidth="1.25" strokeDasharray="4 4" />
        <line x1="610" y1="178" x2="670" y2="178" stroke="#5A594F" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="610" y1="192" x2="670" y2="192" stroke="#5A594F" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="610" y1="202" x2="665" y2="208" stroke="#A6362A" strokeWidth="1.25" strokeDasharray="4 4" />
      </svg>

      {/* Telemetry Status Footer */}
      <div className="mt-2 pt-2 border-t border-[#DDD8D3]/60 flex items-center justify-between font-mono text-[11px] text-[#5A594F]">
        <div>
          <span>MODEL: </span>
          <span className="text-[#16191C] font-semibold">C-MAPSS FD001</span>
          <span className="ml-3">SENSORS: </span>
          <span className="text-[#16191C]">21 ACTIVE</span>
        </div>
        <div>
          <span>HOTTEST STAGE: </span>
          <span className="text-[#A6362A] font-semibold">T48 COMBUSTOR (1412.8 °R)</span>
        </div>
      </div>
    </div>
  );
};
