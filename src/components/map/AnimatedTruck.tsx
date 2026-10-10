import React from 'react';

interface AnimatedTruckProps {
  x: number;
  y: number;
  angle: number;
  isMoving: boolean;
  isPausingAtBin: boolean;
  wasteLoadedKg: number;
  capacityKg: number;
}

export const AnimatedTruck: React.FC<AnimatedTruckProps> = ({
  x,
  y,
  angle,
  isMoving,
  isPausingAtBin,
  wasteLoadedKg,
  capacityKg,
}) => {
  const fillRatio = Math.min(1, wasteLoadedKg / Math.max(1, capacityKg));
  const fillHeight = 14 * fillRatio;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="pointer-events-none select-none transition-transform duration-75"
    >
      {/* Truck Ground Shadow */}
      <ellipse
        cx="0"
        cy="4"
        rx="22"
        ry="10"
        fill="#000000"
        opacity="0.25"
      />

      {/* Rotating Truck Container */}
      <g transform={`rotate(${angle})`}>
        {/* Headlight beams if moving */}
        {isMoving && (
          <polygon
            points="22,-8 48,-18 48,18 22,8"
            fill="url(#headlight-beam-gradient)"
            opacity="0.35"
          />
        )}

        {/* Truck Wheels (Top-down view / Side-top 2.5D view) */}
        {/* Front Wheels */}
        <rect x="8" y="-12" width="8" height="3" rx="1.5" fill="#1e293b" />
        <rect x="8" y="9" width="8" height="3" rx="1.5" fill="#1e293b" />
        {/* Rear Wheels */}
        <rect x="-16" y="-12" width="10" height="3" rx="1.5" fill="#1e293b" />
        <rect x="-16" y="9" width="10" height="3" rx="1.5" fill="#1e293b" />

        {/* Main Cargo Compactor Body (Back) */}
        <rect
          x="-20"
          y="-9"
          width="26"
          height="18"
          rx="3"
          fill="#059669"
          stroke="#064e3b"
          strokeWidth="1.5"
        />

        {/* Cargo Fullness Window / Level */}
        <rect
          x="-18"
          y={9 - fillHeight}
          width="6"
          height={fillHeight}
          rx="1"
          fill="#34d399"
          opacity="0.9"
        />

        {/* Cab (Front) */}
        <path
          d="M6,-8 L18,-7 Q22,-5 22,0 Q22,5 18,7 L6,8 Z"
          fill="#10b981"
          stroke="#064e3b"
          strokeWidth="1.5"
        />

        {/* Windshield */}
        <path
          d="M10,-6 L16,-5 Q18,-3 18,0 Q18,3 16,5 L10,6 Z"
          fill="#e0f2fe"
          stroke="#0284c7"
          strokeWidth="1"
          opacity="0.9"
        />

        {/* Recycling / Eco Emblem on Roof */}
        <circle cx="-7" cy="0" r="4.5" fill="#ffffff" />
        <path
          d="M-8,-2 L-6,0 L-8,2 M-5,-2 L-7,-2 M-5,2 L-7,2"
          stroke="#047857"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Warning Strobe Light */}
        <circle
          cx="3"
          cy="0"
          r="2.5"
          fill="#f59e0b"
          stroke="#ffffff"
          strokeWidth="0.8"
          className={isMoving || isPausingAtBin ? 'animate-pulse' : ''}
        />
      </g>

      {/* Floating Status Pill over Truck */}
      <g transform="translate(0, -22)">
        <rect
          x="-35"
          y="-8"
          width="70"
          height="16"
          rx="8"
          fill="#064e3b"
          stroke="#34d399"
          strokeWidth="1"
          className="shadow-md"
        />
        <text
          y="3.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="9"
          fontWeight="800"
          fontFamily="system-ui"
        >
          {isPausingAtBin ? 'COLLECTING' : `${wasteLoadedKg} kg`}
        </text>
      </g>
    </g>
  );
};
