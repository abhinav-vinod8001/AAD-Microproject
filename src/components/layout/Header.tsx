import React, { useRef } from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import {
  Truck,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { formatDistance, formatWeight } from '../../utils/geometry';
import { exportTownToFile, validateTownData } from '../../utils/storage';

export const Header: React.FC = () => {
  const {
    town,
    activeResult,
    resetDemo,
    loadTownData,
    setIsSettingsModalOpen,
  } = useEcoRoute();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalWasteKg = town.bins
    .filter((bin) => bin.fillPercent >= 40)
    .reduce((sum, bin) => sum + bin.wasteKg, 0);

  const handleExport = () => {
    exportTownToFile(town);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (validateTownData(json)) {
          loadTownData(json);
        } else {
          alert('Invalid town data format. Please upload a valid EcoRoute town JSON.');
        }
      } catch (err) {
        alert('Failed to parse town file: Invalid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/90 flex items-center justify-between shadow-xs select-none z-20">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight m-0 leading-none">
              EcoRoute
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800">
              AAD Project
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">
            Virtual Waste Collection Route Optimization Simulator
          </p>
        </div>
      </div>

      {/* Top Quick Statistics KPIs */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Active vs Skipped Bins */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="text-xs">
            <span className="text-slate-500 mr-1">Active Visited:</span>
            <span className="font-bold text-slate-900">
              {town.bins.filter((b) => b.fillPercent >= 40).length}/{town.bins.length}
            </span>
            <span className="ml-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-full">
              {town.bins.filter((b) => b.fillPercent < 40).length} Skipped
            </span>
          </div>
        </div>

        {/* Total Waste Load */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <div className="text-xs">
            <span className="text-slate-500 mr-1">Waste:</span>
            <span className="font-bold text-slate-900">{formatWeight(totalWasteKg)}</span>
          </div>
        </div>

        {/* Optimized Tour Distance */}
        {activeResult && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <div className="text-xs">
              <span className="text-emerald-700 mr-1">Tour:</span>
              <span className="font-black text-emerald-900">
                {formatDistance(activeResult.totalDistanceMeters)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Reset Demo, Export/Import, Settings */}
      <div className="flex items-center gap-2">
        {/* Reset Demo */}
        <button
          onClick={resetDemo}
          title="Reset to default seeded demo town"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          title="Export current virtual town as JSON"
          className="p-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Load virtual town from JSON file"
          className="p-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Vehicle & Emission Settings */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          title="Configure truck fuel and emission parameters"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
