import React from 'react';
import type { Depot } from '../../types/map';
import { Warehouse } from 'lucide-react';

interface DepotMarkerProps {
  depot: Depot;
  isEditMode: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export const DepotMarker: React.FC<DepotMarkerProps> = ({
  depot,
  isEditMode,
  onMouseDown,
  onClick,
}) => {
  return (
    <g
      transform={`translate(${depot.x}, ${depot.y})`}
      className={`transition-all ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Soft ground highlight */}
      <circle r="32" fill="#10b981" opacity="0.12" />
      <circle r="22" fill="#047857" opacity="0.2" />

      {/* Shadow */}
      <rect x="-18" y="-14" width="38" height="36" rx="8" fill="#000000" opacity="0.18" />

      {/* Main depot structure */}
      <rect
        x="-18"
        y="-18"
        width="36"
        height="36"
        rx="8"
        fill="#065f46"
        stroke="#ffffff"
        strokeWidth="3"
        className="shadow-sm"
      />

      {/* Garage door detail */}
      <rect x="-10" y="2" width="20" height="14" rx="2" fill="#34d399" opacity="0.9" />
      <line x1="-10" y1="6" x2="10" y2="6" stroke="#065f46" strokeWidth="1" />
      <line x1="-10" y1="10" x2="10" y2="10" stroke="#065f46" strokeWidth="1" />

      {/* Central icon */}
      <g transform="translate(-8, -14)">
        <Warehouse className="w-4 h-4 text-white" />
      </g>

      {/* Flag / Badge */}
      <g transform="translate(12, -20)">
        <rect x="0" y="0" width="28" height="15" rx="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <text
          x="14"
          y="10.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontWeight="800"
          fontFamily="system-ui"
          className="select-none"
        >
          DEPOT
        </text>
      </g>

      {/* Depot Name Tag */}
      <g transform="translate(0, 28)" className="pointer-events-none select-none">
        <rect
          x="-55"
          y="-8"
          width="110"
          height="17"
          rx="5"
          fill="#0f172a"
          opacity="0.9"
        />
        <text
          y="4"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="system-ui"
        >
          {depot.name}
        </text>
      </g>
    </g>
  );
};
