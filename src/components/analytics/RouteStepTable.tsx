import React from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { Check, Truck, Clock } from 'lucide-react';

export const RouteStepTable: React.FC = () => {
  const { activeResult, simulation, town, distanceMatrixData } = useEcoRoute();

  if (!activeResult || activeResult.stopSequence.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No optimized route available. Click "Run Optimization" to generate the collection itinerary.
      </div>
    );
  }

  const stops = activeResult.stopSequence;
  const rows = stops.map((stop, idx) => {
    const previousStop = idx === 0 ? null : stops[idx - 1];
    const legDistMeters = previousStop
      ? distanceMatrixData.matrix[previousStop.index]?.[stop.index] ?? 0
      : 0;
    return { stop, idx, legDistMeters };
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <th className="py-2.5 px-3">Leg</th>
            <th className="py-2.5 px-3">Location</th>
            <th className="py-2.5 px-3">Waste Category</th>
            <th className="py-2.5 px-3 text-right">Waste Load</th>
            <th className="py-2.5 px-3 text-right">Cumulative Load</th>
            <th className="py-2.5 px-3 text-right">Leg Dist.</th>
            <th className="py-2.5 px-3 text-right">Cum. Dist.</th>
            <th className="py-2.5 px-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(({ stop, idx, legDistMeters }) => {
            const isFirst = idx === 0;
            const isLast = idx === stops.length - 1;
            const waste = stop.bin?.wasteKg ?? 0;
            const cumulativeDistance = rows.slice(0, idx + 1).reduce((sum, row) => sum + row.legDistMeters, 0);
            const cumulativeWaste = rows.slice(0, idx + 1).reduce((sum, row) => sum + (row.stop.bin?.wasteKg ?? 0), 0);

            const isCurrentLegTarget =
              simulation.status === 'playing' && simulation.currentLegIndex + 1 === idx;
            const isCollected =
              stop.bin && simulation.collectedBinIds.includes(stop.bin.id);

            return (
              <tr
                key={`step-${idx}-${stop.id}`}
                className={`transition-colors ${
                  isCurrentLegTarget
                    ? 'bg-amber-50/90 font-semibold text-amber-950'
                    : isCollected
                    ? 'bg-emerald-50/50 text-slate-700'
                    : 'hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <td className="py-2 px-3 font-mono font-bold text-slate-500">
                  {isFirst ? '0 (Start)' : isLast ? 'Return' : `Stop #${idx}`}
                </td>
                <td className="py-2 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    {stop.isDepot ? (
                      <span className="text-emerald-700 font-bold">DEPOT: {town.depot.name}</span>
                    ) : (
                      <span>{stop.label}</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">
                  {stop.isDepot ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        stop.bin?.type === 'organic'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stop.bin?.type === 'recyclable'
                          ? 'bg-sky-100 text-sky-800'
                          : stop.bin?.type === 'hazardous'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {stop.bin?.type}
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-medium">
                  {waste > 0 ? `${waste} kg` : '—'}
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-600">
                  {cumulativeWaste} kg
                </td>
                <td className="py-2 px-3 text-right font-medium">
                  {legDistMeters > 0 ? `${legDistMeters} m` : '—'}
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">
                  {cumulativeDistance} m
                </td>
                <td className="py-2 px-3 text-center">
                  {isCurrentLegTarget ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full animate-pulse">
                      <Truck className="w-3 h-3" /> En Route
                    </span>
                  ) : isCollected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Collected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> Scheduled
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Skipped Low Waste Bins Summary */}
      {(() => {
        const skippedBins = town.bins.filter((b) => b.fillPercent < 40);
        if (skippedBins.length === 0) return null;
        return (
          <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{skippedBins.length} Bins Skipped (Low Fill Level &lt; 40%):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skippedBins.map((b) => (
                <span
                  key={b.id}
                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 text-[11px] font-medium"
                >
                  🟢 {b.label || b.id} ({b.fillPercent}%)
                </span>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
