import React, { useState, useEffect } from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { DEFAULT_VEHICLE_SETTINGS } from '../../utils/storage';
import { X, Sliders, RotateCcw, Save, Fuel, ShieldCheck, Leaf } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen, settings, updateSettings } = useEcoRoute();

  const [fuelEff, setFuelEff] = useState<number>(settings.fuelEfficiencyLPer100Km);
  const [emissionFactor, setEmissionFactor] = useState<number>(settings.emissionFactorKgPerL);
  const [capacity, setCapacity] = useState<number>(settings.truckCapacityKg);

  useEffect(() => {
    setFuelEff(settings.fuelEfficiencyLPer100Km);
    setEmissionFactor(settings.emissionFactorKgPerL);
    setCapacity(settings.truckCapacityKg);
  }, [settings]);

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    updateSettings({
      fuelEfficiencyLPer100Km: Number(fuelEff),
      emissionFactorKgPerL: Number(emissionFactor),
      truckCapacityKg: Number(capacity),
    });
    setIsSettingsModalOpen(false);
  };

  const handleResetDefaults = () => {
    setFuelEff(DEFAULT_VEHICLE_SETTINGS.fuelEfficiencyLPer100Km);
    setEmissionFactor(DEFAULT_VEHICLE_SETTINGS.emissionFactorKgPerL);
    setCapacity(DEFAULT_VEHICLE_SETTINGS.truckCapacityKg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Vehicle & Emission Parameters</h3>
              <p className="text-xs text-slate-500">Configure truck specifications and emission factors</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                Truck Fuel Consumption Rate
              </label>
              <span className="text-xs font-bold text-slate-800">{fuelEff} L / 100km</span>
            </div>
            <input
              type="number"
              step="0.5"
              min="10"
              max="60"
              value={fuelEff}
              onChange={(e) => setFuelEff(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Standard medium diesel collection truck: 25 - 32 L / 100 km.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                CO₂ Emission Factor
              </label>
              <span className="text-xs font-bold text-slate-800">{emissionFactor} kg CO₂ / L</span>
            </div>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="5.0"
              value={emissionFactor}
              onChange={(e) => setEmissionFactor(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Diesel emission standard: ~2.68 kg CO₂ per liter of fuel.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garbage Truck Payload Capacity
              </label>
              <span className="text-xs font-bold text-slate-800">{capacity} kg</span>
            </div>
            <input
              type="number"
              step="50"
              min="500"
              max="5000"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700">Academic Project Label Note:</span>
            <p>
              All fuel and carbon emission metrics are analytical estimates based on these user-configurable parameters, labeled as estimates for algorithm simulation purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
