import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Grid, Magnet } from 'lucide-react';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetView: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToRoads: boolean;
  onToggleSnap: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
  showGrid,
  onToggleGrid,
  snapToRoads,
  onToggleSnap,
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-xl p-1.5 transition-all">
      <div className="flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="text-[11px] font-semibold text-center text-slate-500 py-0.5 select-none">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-slate-200 my-0.5" />

      <button
        onClick={onFitView}
        title="Fit Map to View"
        className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <button
        onClick={onResetView}
        title="Reset Pan & Zoom"
        className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="h-px bg-slate-200 my-0.5" />

      <button
        onClick={onToggleGrid}
        title={showGrid ? 'Hide Coordinate Grid' : 'Show Coordinate Grid'}
        className={`p-2 rounded-lg transition-colors ${
          showGrid
            ? 'bg-emerald-100 text-emerald-800'
            : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleSnap}
        title={snapToRoads ? 'Disable Road Snapping' : 'Enable Road Snapping'}
        className={`p-2 rounded-lg transition-colors ${
          snapToRoads
            ? 'bg-emerald-100 text-emerald-800'
            : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        <Magnet className="w-4 h-4" />
      </button>
    </div>
  );
};
