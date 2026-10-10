import React from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { calculateSustainabilityImpact } from '../../algorithms/baselineTour';
import { formatDistance, formatWeight } from '../../utils/geometry';
import { Fuel, Leaf, TrendingDown, Award, Compass } from 'lucide-react';

export const SustainabilityCard: React.FC = () => {
  const { activeResult, baselineResult, settings, town } = useEcoRoute();

  if (!activeResult || !baselineResult) return null;

  const impact = calculateSustainabilityImpact(activeResult, baselineResult, settings);
  const activeBins = town.bins.filter((bin) => bin.fillPercent >= 40);
  const totalWasteKg = activeBins.reduce((sum, bin) => sum + bin.wasteKg, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* Route Distance & Baseline Metric */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Route Distance</span>
          <Compass className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatDistance(activeResult.totalDistanceMeters)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className="text-slate-400 line-through">
              {formatDistance(baselineResult.totalDistanceMeters)}
            </span>
            <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -{impact.percentageSaved}%
            </span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2">
          {formatDistance(impact.distanceSavedMeters)} saved vs baseline
        </div>
      </div>

      {/* Fuel Consumption Estimate */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Est. Fuel Consumed</span>
          <Fuel className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {impact.estimatedFuelLiters} <span className="text-sm font-semibold text-slate-500">Liters</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
            <span>{impact.fuelSavedLiters} L saved</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2">
          Based on {settings.fuelEfficiencyLPer100Km} L/100km (Estimate)
        </div>
      </div>

      {/* Avoided CO2 Emissions */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Est. CO₂ Emissions</span>
          <Leaf className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {impact.estimatedCO2Kg} <span className="text-sm font-semibold text-slate-500">kg CO₂</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
            <span>-{impact.co2SavedKg} kg CO₂ avoided</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-2">
          Factor: {settings.emissionFactorKgPerL} kg/L diesel (Estimate)
        </div>
      </div>

      {/* Collection Efficiency Score */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between opacity-90 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Collection Load</span>
          <Award className="w-4 h-4 text-emerald-200" />
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight">
            {formatWeight(totalWasteKg)}
          </div>
          <div className="text-xs opacity-90 mt-0.5">
            Across {activeBins.length} scheduled collection points
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-emerald-500/40">
          <span className="opacity-80">Payload utilization:</span>
          <span className="font-bold">
            {Math.round((totalWasteKg / settings.truckCapacityKg) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
