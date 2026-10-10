import React from 'react';
import type { TSPStop, DistanceMatrixData } from '../../types/tsp';

interface RouteOverlayProps {
  stops: TSPStop[];
  activeLegIndex?: number;
  isSimulating: boolean;
  distanceMatrixData?: DistanceMatrixData;
}

export const RouteOverlay: React.FC<RouteOverlayProps> = ({
  stops,
  activeLegIndex = -1,
  isSimulating,
  distanceMatrixData,
}) => {
  // If no tour or only depot-to-depot return with no stops, don't render overlay
  if (stops.length < 2 || (stops.length === 2 && stops[0].id === stops[1].id)) return null;

  return (
    <g className="route-overlay pointer-events-none">
      {/* Background soft glow for the entire tour */}
      <polyline
        points={(() => {
          let allPoints: string[] = [];
          for (let i = 0; i < stops.length - 1; i++) {
            const overrideKey = `${stops[i].id}-${stops[i + 1].id}`;
            const rawLeg = distanceMatrixData?.paths?.[overrideKey];
            const legPaths = rawLeg && rawLeg.length >= 2 ? rawLeg : [stops[i], stops[i + 1]];
            const pts = legPaths.filter(Boolean).map((p) => `${p.x},${p.y}`);
            if (i > 0 && pts.length > 0) pts.shift(); // remove overlapping start
            allPoints = allPoints.concat(pts);
          }
          return allPoints.join(' ');
        })()}
        fill="none"
        stroke="#10b981"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* Main route paths segment by segment */}
      {stops.slice(0, -1).map((fromStop, idx) => {
        const toStop = stops[idx + 1];
        if (!fromStop || !toStop) return null;

        const isActiveLeg = isSimulating && activeLegIndex === idx;
        const isPastLeg = isSimulating && activeLegIndex > idx;

        const overrideKey = `${fromStop.id}-${toStop.id}`;
        const rawLeg = distanceMatrixData?.paths?.[overrideKey];
        const pathPoints = rawLeg && rawLeg.length >= 2 ? rawLeg : [fromStop, toStop];
        if (pathPoints.length < 2) return null;

        const midIdx = Math.max(1, Math.floor(pathPoints.length / 2));
        const midP1 = pathPoints[midIdx - 1] || pathPoints[0];
        const midP2 = pathPoints[midIdx] || midP1;
        if (!midP1 || !midP2) return null;

        const midX = (midP1.x + midP2.x) / 2;
        const midY = (midP1.y + midP2.y) / 2;
        const angle = (Math.atan2(midP2.y - midP1.y, midP2.x - midP1.x) * 180) / Math.PI;

        return (
          <g key={`leg-${idx}-${fromStop.id}-${toStop.id}`}>
            {/* Segment polyline */}
            <polyline
              points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={isActiveLeg ? '#f59e0b' : isPastLeg ? '#059669' : '#10b981'}
              strokeWidth={isActiveLeg ? 4.5 : 3}
              strokeDasharray={isActiveLeg ? '8 4' : isPastLeg ? 'none' : '6 3'}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isActiveLeg ? 'animate-pulse' : ''}
              opacity={isPastLeg ? 0.7 : 0.95}
            />

            {/* Direction Arrow at midpoint */}
            <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
              <polygon
                points="-5,-4 4,0 -5,4 -2,0"
                fill={isActiveLeg ? '#f59e0b' : isPastLeg ? '#047857' : '#059669'}
              />
            </g>
          </g>
        );
      })}

      {/* Return leg to Depot emphasis */}
      {stops.length > 2 && (
        <circle
          cx={stops[stops.length - 1].x}
          cy={stops[stops.length - 1].y}
          r="8"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeDasharray="2 2"
        />
      )}
    </g>
  );
};
