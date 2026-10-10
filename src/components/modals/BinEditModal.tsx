import React, { useState, useEffect } from 'react';
import type { BinType } from '../../types/map';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { getBinFillInfo } from '../../algorithms/distanceMatrix';
import { X, Trash2, Flame, Leaf, Package, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const BinEditModal: React.FC = () => {
  const { selectedBin, setSelectedBin, updateBin, deleteBin } = useEcoRoute();

  const [label, setLabel] = useState('');
  const [wasteKg, setWasteKg] = useState<number>(50);
  const [type, setType] = useState<BinType>('organic');
  const [fillPercent, setFillPercent] = useState<number>(75);

  useEffect(() => {
    if (selectedBin) {
      setLabel(selectedBin.label || '');
      setWasteKg(selectedBin.wasteKg);
      setType(selectedBin.type);
      setFillPercent(selectedBin.fillPercent);
    }
  }, [selectedBin]);

  if (!selectedBin) return null;

  const fillInfo = getBinFillInfo(fillPercent);

  const handleSave = () => {
    updateBin(selectedBin.id, {
      label,
      wasteKg: Number(wasteKg),
      type,
      fillPercent: Number(fillPercent),
    });
    setSelectedBin(null);
  };

  const handleDelete = () => {
    deleteBin(selectedBin.id);
  };

  const binTypes: { type: BinType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'organic', label: 'Organic', icon: <Leaf className="w-4 h-4 text-emerald-600" />, color: 'border-emerald-500 bg-emerald-50' },
    { type: 'recyclable', label: 'Recyclable', icon: <Package className="w-4 h-4 text-sky-600" />, color: 'border-sky-500 bg-sky-50' },
    { type: 'general', label: 'General', icon: <Trash2 className="w-4 h-4 text-slate-600" />, color: 'border-slate-500 bg-slate-50' },
    { type: 'hazardous', label: 'Hazardous', icon: <Flame className="w-4 h-4 text-rose-600" />, color: 'border-rose-500 bg-rose-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
              style={{ backgroundColor: fillInfo.fillColor }}
            >
              {selectedBin.id.replace('BIN-', '#')}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Edit Waste Bin</h3>
              <p className="text-xs text-slate-500">Coordinate: ({selectedBin.x}, {selectedBin.y})</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBin(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Location / Bin Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Oak Residences A"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Bin Fill Level Selection (Key User Feature) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Bin Fill Level & Routing Status
              </label>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${fillInfo.bgClass}`}
              >
                {fillPercent}% • {fillInfo.label}
              </span>
            </div>

            {/* Quick Presets: Low (Green), Medium (Yellow), Full (Red) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFillPercent(25)}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  fillInfo.level === 'low'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="text-sm">🟢</div>
                <div className="text-[11px] font-bold mt-0.5">Low (25%)</div>
                <div className="text-[9px] text-emerald-700 font-semibold">Skipped</div>
              </button>

              <button
                type="button"
                onClick={() => setFillPercent(60)}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  fillInfo.level === 'medium'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="text-sm">🟡</div>
                <div className="text-[11px] font-bold mt-0.5">Medium (60%)</div>
                <div className="text-[9px] text-amber-700 font-semibold">Visited</div>
              </button>

              <button
                type="button"
                onClick={() => setFillPercent(90)}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  fillInfo.level === 'full'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-extrabold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs'
                }`}
              >
                <div className="text-sm">🔴</div>
                <div className="text-[11px] font-bold mt-0.5">Full (90%)</div>
                <div className="text-[9px] text-rose-700 font-semibold">Urgent Visit</div>
              </button>
            </div>

            {/* Slider */}
            <div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={fillPercent}
                onChange={(e) => setFillPercent(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: fillInfo.fillColor,
                  background: `linear-gradient(to right, ${fillInfo.fillColor} 0%, ${fillInfo.fillColor} ${fillPercent}%, #e2e8f0 ${fillPercent}%, #e2e8f0 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-600 font-bold">0% (Low Green - Ignored)</span>
                <span className="text-amber-600 font-bold">40% Medium</span>
                <span className="text-rose-600 font-bold">75%+ Full (Red)</span>
              </div>
            </div>

            {/* Routing Decision Banner */}
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${
                fillInfo.shouldCollect
                  ? 'bg-amber-100/70 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100/70 text-emerald-900 border border-emerald-300'
              }`}
            >
              {fillInfo.shouldCollect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Scheduled for Collection:</strong> This bin will be visited by the truck.
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Skipped by Route:</strong> Fill level is low ({fillPercent}% &lt; 40%). Truck skips to conserve fuel.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bin Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Waste Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {binTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    type === item.type
                      ? `${item.color} shadow-xs font-bold`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Waste Quantity (kg) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Estimated Waste Load
              </label>
              <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {wasteKg} kg
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={wasteKg}
              onChange={(e) => setWasteKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Bin
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedBin(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
