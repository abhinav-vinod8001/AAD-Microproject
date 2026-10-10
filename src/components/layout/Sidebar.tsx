import React from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import type { AppMode } from '../../context/EcoRouteContext';
import {
  Map,
  Trash2,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Gauge,
  Clock,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDistance } from '../../utils/geometry';

export const Sidebar: React.FC = () => {
  const {
    mode,
    setMode,
    selectedAlgorithm,
    setSelectedAlgorithm,
    runOptimization,
    runFullComparison,
    isComputing,
    needsRecalculation,
    activeResult,
    simulation,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setSimulationSpeed,
    town,
    settings,
    setBinFillLevel,
    batchSetBinLevels,
    setSelectedBin,
  } = useEcoRoute();

  const fullBins = town.bins.filter((b) => b.fillPercent >= 75);
  const medBins = town.bins.filter((b) => b.fillPercent >= 40 && b.fillPercent < 75);
  const lowBins = town.bins.filter((b) => b.fillPercent < 40);

  const activeStopsCount = fullBins.length + medBins.length;

  const modes: { id: AppMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'view-route',
      label: 'View Route',
      icon: <Navigation className="w-4 h-4" />,
      desc: 'Inspect tour & simulate truck',
    },
    {
      id: 'manage-bins',
      label: 'Manage Bins',
      icon: <Trash2 className="w-4 h-4" />,
      desc: 'Plant, drag & edit waste bins',
    },
    {
      id: 'edit-map',
      label: 'Edit Map',
      icon: <Map className="w-4 h-4" />,
      desc: 'Draw roads & intersections',
    },
  ];

  const handleSimToggle = () => {
    if (simulation.status === 'playing') {
      pauseSimulation();
    } else if (simulation.status === 'paused') {
      resumeSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200/90 flex flex-col justify-between overflow-y-auto select-none z-10 shadow-xs">
      <div className="p-4 space-y-4">
        {/* 1. Mode Switcher */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Workspace Mode
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === m.id
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={m.desc}
              >
                <div className={mode === m.id ? 'text-emerald-600' : 'text-slate-500'}>
                  {m.icon}
                </div>
                <span className="mt-1 text-[11px]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Smart Waste Bin Fill Routing Management (User Request) */}
        <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                Bin Levels & Routing Policy
              </label>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {activeStopsCount}/{town.bins.length} Visited
            </span>
          </div>

          {/* Color-Coded Status Cards */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Red / Full */}
            <div className="p-1.5 rounded-xl bg-red-50/90 border border-red-200/90">
              <div className="text-sm font-black text-red-700">{fullBins.length}</div>
              <div className="text-[10px] font-bold text-red-600 flex items-center justify-center gap-0.5">
                <span>🔴</span> Full
              </div>
              <div className="text-[8px] text-red-700 uppercase font-black">Visited</div>
            </div>

            {/* Yellow / Medium */}
            <div className="p-1.5 rounded-xl bg-amber-50/90 border border-amber-200/90">
              <div className="text-sm font-black text-amber-700">{medBins.length}</div>
              <div className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
                <span>🟡</span> Med
              </div>
              <div className="text-[8px] text-amber-700 uppercase font-black">Visited</div>
            </div>

            {/* Green / Low (Skipped) */}
            <div className="p-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90">
              <div className="text-sm font-black text-emerald-700">{lowBins.length}</div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                <span>🟢</span> Low
              </div>
              <div className="text-[8px] text-emerald-700 uppercase font-black">Skipped</div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            Truck visits <strong>Yellow</strong> (medium) &amp; <strong>Red</strong> (full) bins only. <strong>Green</strong> bins (&lt;40% waste) are skipped to conserve fuel.
          </p>

          {/* Quick Presets */}
          <div className="space-y-1">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Set Bin Level Presets:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => batchSetBinLevels('smart-mix')}
                className="py-1 px-1.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Apply realistic test mix (Green, Yellow, Red)"
              >
                ⚖️ Smart Mix
              </button>
              <button
                type="button"
                onClick={() => batchSetBinLevels('random')}
                className="py-1 px-1.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Randomize bin sensor fill levels"
              >
                🎲 Randomize
              </button>
              <button
                type="button"
                onClick={() => batchSetBinLevels('all-full')}
                className="py-1 px-1.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-rose-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Set all bins to Full (Red - all visited)"
              >
                🔴 All Full
              </button>
              <button
                type="button"
                onClick={() => batchSetBinLevels('all-low')}
                className="py-1 px-1.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-emerald-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Set all bins to Low (Green - all skipped)"
              >
                🟢 All Low (Skip)
              </button>
            </div>
          </div>

          {/* 1-Click Interactive Bin Level Toggle List */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
              <span>Click badge to cycle:</span>
              <span className="text-[9px] text-slate-400">🟢 &rarr; 🟡 &rarr; 🔴</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {town.bins.map((bin) => {
                const isFull = bin.fillPercent >= 75;
                const isMed = bin.fillPercent >= 40 && bin.fillPercent < 75;
                const isLow = bin.fillPercent < 40;

                // Cycle: Low (25%) -> Medium (60%) -> Full (90%) -> Low (20%)
                const nextPercent = isLow ? 60 : isMed ? 90 : 20;

                return (
                  <div
                    key={bin.id}
                    className="flex items-center justify-between py-1 px-2 bg-white rounded-lg border border-slate-200/70 hover:border-slate-300 text-xs"
                  >
                    <span
                      onClick={() => setSelectedBin(bin)}
                      className="truncate max-w-[130px] font-medium text-slate-700 hover:text-emerald-700 cursor-pointer text-[11px]"
                      title={`${bin.label || bin.id} - click to inspect & edit`}
                    >
                      {bin.label || bin.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBinFillLevel(bin.id, nextPercent)}
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-black cursor-pointer transition-all ${
                        isFull
                          ? 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                          : isMed
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      }`}
                      title={`Click to cycle level (Current: ${bin.fillPercent}%)`}
                    >
                      {isFull ? `🔴 ${bin.fillPercent}%` : isMed ? `🟡 ${bin.fillPercent}%` : `🟢 ${bin.fillPercent}%`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. TSP Algorithm Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              TSP Optimization Solver
            </label>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Academic v1
            </span>
          </div>

          <div className="space-y-2">
            {/* Nearest Neighbor Option */}
            <div
              onClick={() => setSelectedAlgorithm('nearest-neighbor')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAlgorithm === 'nearest-neighbor'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedAlgorithm === 'nearest-neighbor'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedAlgorithm === 'nearest-neighbor' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Nearest Neighbor (Greedy)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">O(n²)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5.5 leading-tight">
                Iteratively selects closest unvisited stop. High speed, ideal initial tour.
              </p>
            </div>

            {/* Branch and Bound Option */}
            <div
              onClick={() => setSelectedAlgorithm('branch-and-bound')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAlgorithm === 'branch-and-bound'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedAlgorithm === 'branch-and-bound'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedAlgorithm === 'branch-and-bound' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Branch & Bound (Exact)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">MST Bound</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5.5 leading-tight">
                Guaranteed optimal tour with MST lower-bound pruning for active stops.
              </p>
            </div>
          </div>

          {/* Solver Actions */}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => runOptimization()}
              disabled={isComputing}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                needsRecalculation
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isComputing
                  ? 'Computing Solver...'
                  : needsRecalculation
                  ? 'Recalculate Tour'
                  : 'Run Optimization'}
              </span>
            </button>

            <button
              onClick={runFullComparison}
              disabled={isComputing}
              className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Benchmark Both Solvers</span>
            </button>
          </div>
        </div>

        {/* 4. Truck Simulation Controls */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Collection Simulation
            </label>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                simulation.status === 'playing'
                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                  : simulation.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {simulation.status.toUpperCase()}
            </span>
          </div>

          {/* Play / Pause / Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimToggle}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                simulation.status === 'playing'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {simulation.status === 'playing' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : simulation.status === 'paused' ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Tour</span>
                </>
              )}
            </button>

            <button
              onClick={resetSimulation}
              title="Reset truck to depot"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Simulation Speed presets */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-slate-400" /> Speed:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[0.5, 1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    simulation.speedMultiplier === speed
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Progress & Status Message */}
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Bins Collected</span>
                <span>
                  {simulation.collectedBinIds.length} of {activeStopsCount} active
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${
                      activeStopsCount > 0
                        ? (simulation.collectedBinIds.length / activeStopsCount) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/50">
              <span className="text-slate-500">Waste Loaded:</span>
              <span className="font-bold text-slate-800">
                {simulation.currentWasteLoadedKg} / {settings.truckCapacityKg} kg
              </span>
            </div>

            <div className="text-[11px] text-slate-500 italic pt-1 truncate" title={simulation.message}>
              "{simulation.message}"
            </div>
          </div>
        </div>

        {/* 5. Active Solver Metrics */}
        {activeResult && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Solver Execution Profile
            </label>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Compass className="w-3.5 h-3.5" /> Total Distance:
                </span>
                <span className="font-bold text-slate-900">
                  {formatDistance(activeResult.totalDistanceMeters)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Execution Time:
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {activeResult.executionTimeMs} ms
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Active Stops Visited:</span>
                <span className="font-mono text-slate-800 font-bold">
                  {activeStopsCount} (Skipped {lowBins.length} green)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Nodes Explored:</span>
                <span className="font-mono text-slate-800">
                  {activeResult.nodesExplored.toLocaleString()}
                </span>
              </div>
              {activeResult.algorithm === 'branch-and-bound' && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Pruned Subtrees:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {activeResult.prunedBranches.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer info badge */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-[10px] text-slate-400 text-center">
        EcoRoute Simulator • AAD Microproject
      </div>
    </aside>
  );
};
