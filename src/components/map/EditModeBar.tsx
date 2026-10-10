import React from 'react';
import type { AppMode } from '../../context/EcoRouteContext';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { AlertCircle, Plus, RefreshCw, Trash2, Truck } from 'lucide-react';

interface EditModeBarProps {
  mode: AppMode;
}

export const EditModeBar: React.FC<EditModeBarProps> = ({ mode }) => {
  const {
    needsRecalculation,
    runOptimization,
    selectedAlgorithm,
    selectedNode,
    deleteNode,
    selectedEdge,
    deleteEdge,
    selectedBin,
    deleteBin,
    addBin,
    town,
    isComputing,
    activeResult,
  } = useEcoRoute();

  const handleQuickAddBin = () => {
    // Add bin near center of the map
    addBin({
      x: 500 + (Math.random() * 200 - 100),
      y: 400 + (Math.random() * 200 - 100),
      wasteKg: Math.floor(Math.random() * 60) + 30,
      type: 'organic',
      fillPercent: 75,
    });
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
      {/* Needs recalculation alert pill */}
      {needsRecalculation && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/95 text-white rounded-lg shadow-md backdrop-blur-sm text-xs font-semibold animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Map Modified: Route Outdated</span>
          <button
            onClick={() => runOptimization(selectedAlgorithm)}
            disabled={isComputing}
            className="ml-1 px-2 py-0.5 bg-white text-amber-900 rounded font-bold hover:bg-amber-100 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isComputing ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>
      )}

      {/* Mode Status Pill */}
      {mode === 'edit-map' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-slate-100 rounded-lg shadow-md backdrop-blur-sm text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span className="font-semibold text-blue-300">Edit Map:</span>
          <span className="text-slate-300 hidden sm:inline">
            Click empty space to add intersection • Drag to move • Click two nodes to connect road
          </span>
          {selectedNode && (
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="ml-2 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Node
            </button>
          )}
          {selectedEdge && (
            <button
              onClick={() => deleteEdge(selectedEdge.id)}
              className="ml-2 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Road
            </button>
          )}
        </div>
      )}

      {mode === 'manage-bins' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-slate-100 rounded-lg shadow-md backdrop-blur-sm text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Manage Bins:</span>
          <span className="text-slate-300 hidden sm:inline">
            Click on canvas/road to plant bin • Drag to relocate • Click to edit attributes
          </span>
          <button
            onClick={handleQuickAddBin}
            className="ml-2 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Bin
          </button>
          {selectedBin && (
            <button
              onClick={() => deleteBin(selectedBin.id)}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Bin ({selectedBin.id})
            </button>
          )}
        </div>
      )}

      {mode === 'view-route' && !needsRecalculation && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/90 text-emerald-100 rounded-lg shadow-md backdrop-blur-sm text-xs">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-white">Route Inspection & Simulation Active</span>
          <span className="text-emerald-300/80">
            ({activeResult ? activeResult.stopSequence.filter((s) => !s.isDepot).length : 0} stops visited •{' '}
            {town.bins.filter((b) => b.fillPercent < 40).length} low bins skipped)
          </span>
        </div>
      )}
    </div>
  );
};
