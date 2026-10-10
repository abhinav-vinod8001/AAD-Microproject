import React, { useState, useEffect } from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { X, Trash2, Save, Route } from 'lucide-react';

export const RoadEditModal: React.FC = () => {
  const { selectedEdge, setSelectedEdge, updateEdge, deleteEdge } = useEcoRoute();

  const [streetName, setStreetName] = useState('');
  const [lengthMeters, setLengthMeters] = useState<number>(500);

  useEffect(() => {
    if (selectedEdge) {
      setStreetName(selectedEdge.streetName || '');
      setLengthMeters(selectedEdge.lengthMeters);
    }
  }, [selectedEdge]);

  if (!selectedEdge) return null;

  const handleSave = () => {
    updateEdge(selectedEdge.id, {
      streetName,
      lengthMeters: Number(lengthMeters),
    });
    setSelectedEdge(null);
  };

  const handleDelete = () => {
    deleteEdge(selectedEdge.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Edit Road Segment</h3>
              <p className="text-xs text-slate-500">Segment ID: {selectedEdge.id}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEdge(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Street Name
            </label>
            <input
              type="text"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder="e.g. Oak Boulevard"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assigned Road Length (Metres)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="5000"
                step="10"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <span className="text-xs font-bold text-slate-500">meters</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Road
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedEdge(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
