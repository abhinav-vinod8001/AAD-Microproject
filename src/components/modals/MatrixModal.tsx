import React from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { X, Table, Edit3 } from 'lucide-react';

export const MatrixModal: React.FC = () => {
  const {
    isMatrixModalOpen,
    setIsMatrixModalOpen,
    distanceMatrixData,
  } = useEcoRoute();

  if (!isMatrixModalOpen) return null;

  const { stops, matrix } = distanceMatrixData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Stop-to-Stop Distance Matrix (m)</h3>
              <p className="text-xs text-slate-500">
                Pairwise travel distances between Depot and active bins • calculated from the road network
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMatrixModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
          <div className="px-6 py-2.5 bg-emerald-50/40 border-b border-emerald-100 flex items-center text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Using shortest road-network distance and each road's configured meter length
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-2 font-bold text-slate-400 sticky left-0 bg-white z-10">Stop</th>
                {stops.map((stop) => (
                  <th
                    key={`col-${stop.id}`}
                    className="p-2 font-bold text-slate-700 text-center whitespace-nowrap min-w-[70px]"
                  >
                    <div className="truncate max-w-[80px]" title={stop.label}>
                      {stop.isDepot ? 'DEPOT' : stop.id.replace('BIN-', '#')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stops.map((rowStop, i) => (
                <tr key={`row-${rowStop.id}`} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="p-2 font-bold text-slate-700 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-100">
                    <span className={rowStop.isDepot ? 'text-emerald-700' : 'text-slate-800'}>
                      {rowStop.isDepot ? '0: DEPOT' : `${i}: ${rowStop.id}`}
                    </span>
                  </td>
                  {stops.map((colStop, j) => {
                    const isDiagonal = i === j;
                    return (
                      <td
                        key={`cell-${i}-${j}`}
                        className={`p-1.5 text-center transition-colors ${
                          isDiagonal
                            ? 'bg-slate-100/70 text-slate-400 font-normal'
                            : 'text-slate-700 font-medium'
                        }`}
                        title={isDiagonal ? 'Zero distance to self' : `Road-network distance between ${rowStop.label} and ${colStop.label}.`}
                      >
                        <span>{matrix[i][j]}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Distances are fixed to the visible road network so the route and animation always agree.
          </span>
          <button
            onClick={() => setIsMatrixModalOpen(false)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
