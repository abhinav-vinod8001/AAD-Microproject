import React from 'react';
import type { WasteBin } from '../../types/map';
import { getBinFillInfo } from '../../algorithms/distanceMatrix';
import { Check, Flame, Leaf, Package, Trash2 } from 'lucide-react';

interface BinMarkerProps {
  bin: WasteBin;
  stopIndex?: number;
  isCollected?: boolean;
  isCurrentTarget?: boolean;
  isBeingCollected?: boolean;
  isSelected?: boolean;
  isManageMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const BinMarker: React.FC<BinMarkerProps> = ({
  bin,
  stopIndex,
  isCollected = false,
  isCurrentTarget = false,
  isBeingCollected = false,
  isSelected = false,
  isManageMode,
  onClick,
  onMouseDown,
}) => {
  const fillInfo = getBinFillInfo(bin.fillPercent);
  const isIgnoredGreen = !fillInfo.shouldCollect; // Low waste level (< 40%)

  return (
    <g
      transform={`translate(${bin.x}, ${bin.y})`}
      className={`transition-all ${
        isManageMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isIgnoredGreen ? 'opacity-85 hover:opacity-100' : ''}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {/* Current target pulsing aura */}
      {isCurrentTarget && (
        <circle
          r="28"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3.5"
          strokeDasharray="4 4"
          className="animate-spin opacity-90"
          style={{ transformOrigin: '0 0', animationDuration: '4s' }}
        />
      )}

      {/* Full Priority Urgent Pulsing Aura for Red Bins (if not yet collected) */}
      {fillInfo.level === 'full' && !isCollected && !isCurrentTarget && (
        <circle
          r="22"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="3 3"
          className="animate-pulse opacity-70"
          style={{ transformOrigin: '0 0' }}
        />
      )}

      {/* Being collected pulsing glow */}
      {isBeingCollected && (
        <circle
          r="32"
          fill="#10b981"
          opacity="0.35"
          className="animate-ping"
          style={{ transformOrigin: '0 0' }}
        />
      )}

      {/* Selected highlight ring */}
      {isSelected && (
        <circle
          r="24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeDasharray="3 3"
          opacity="0.9"
        />
      )}

      {/* Drop shadow */}
      <circle cx="1" cy="2" r="15" fill="#000000" opacity="0.18" />

      {/* Outer pin body - COLOR-CODED BY FILL LEVEL:
          - Green (#10b981) for Low Waste (< 40%)
          - Yellow (#f59e0b) for Medium Waste (40% - 74%)
          - Red (#ef4444) for Full Waste (>= 75%)
      */}
      <circle
        r="15"
        fill={isCollected ? '#059669' : fillInfo.fillColor}
        stroke="#ffffff"
        strokeWidth="2.5"
        className="transition-colors duration-300"
      />

      {/* Fill level progress arc around perimeter */}
      <circle
        r="12"
        fill="none"
        stroke={isCollected ? '#047857' : fillInfo.strokeColor}
        strokeWidth="2"
        strokeDasharray="75.4"
        strokeDashoffset={75.4 * (1 - bin.fillPercent / 100)}
        transform="rotate(-90)"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Status Content: Stop sequence number, checkmark, or low skip symbol */}
      {isCollected ? (
        <g transform="translate(-6, -6)">
          <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
        </g>
      ) : stopIndex !== undefined ? (
        <text
          y="4.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui"
          className="select-none drop-shadow-xs"
        >
          {stopIndex}
        </text>
      ) : isIgnoredGreen ? (
        // Green Bin Skipped Indicator
        <text
          y="3.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8"
          fontWeight="900"
          fontFamily="system-ui"
          className="select-none"
        >
          SKIP
        </text>
      ) : (
        <circle r="4.5" fill="#ffffff" />
      )}

      {/* Top-right Status Badge */}
      <g transform="translate(9, -15)">
        <circle
          cx="5"
          cy="5"
          r="7.5"
          fill="#ffffff"
          stroke={isCollected ? '#059669' : fillInfo.strokeColor}
          strokeWidth="1.5"
          className="drop-shadow-xs"
        />
        <g transform="translate(1.5, 1.5)">
          {bin.type === 'organic' && (
            <Leaf className="w-2 h-2 text-emerald-600" />
          )}
          {bin.type === 'recyclable' && (
            <Package className="w-2 h-2 text-sky-600" />
          )}
          {bin.type === 'hazardous' && (
            <Flame className="w-2 h-2 text-rose-600" />
          )}
          {bin.type === 'general' && (
            <Trash2 className="w-2 h-2 text-slate-600" />
          )}
        </g>
      </g>

      {/* Fill Level State Flag for Green Skipped Bins */}
      {isIgnoredGreen && (
        <g transform="translate(-16, -16)">
          <rect
            x="0"
            y="0"
            width="14"
            height="14"
            rx="4"
            fill="#059669"
            stroke="#ffffff"
            strokeWidth="1"
          />
          <text
            x="7"
            y="10"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            🌱
          </text>
        </g>
      )}

      {/* Bin Label tooltip in SVG */}
      <g
        transform="translate(0, 26)"
        className="pointer-events-none opacity-95 select-none"
      >
        <rect
          x="-48"
          y="-9"
          width="96"
          height="18"
          rx="5"
          fill="#0f172a"
          opacity="0.9"
        />
        <text
          y="3.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontWeight="700"
          fontFamily="system-ui"
        >
          {isCollected
            ? `Collected (${bin.wasteKg}kg)`
            : isIgnoredGreen
            ? `${bin.fillPercent}% • LOW (SKIPPED)`
            : stopIndex !== undefined
            ? `${bin.fillPercent}% • #${stopIndex} (${fillInfo.level.toUpperCase()})`
            : `${bin.fillPercent}% • ${fillInfo.level.toUpperCase()}`}
        </text>
      </g>
    </g>
  );
};
