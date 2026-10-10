import React, { useState } from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { SustainabilityCard } from '../analytics/SustainabilityCard';
import { ComparisonChart } from '../analytics/ComparisonChart';
import { RouteStepTable } from '../analytics/RouteStepTable';
import {
  ChevronUp,
  ChevronDown,
  Leaf,
  BarChart2,
  ListOrdered,
  TrendingDown,
  Table,
  Terminal,
} from 'lucide-react';
import { formatDistance } from '../../utils/geometry';
import { AlgorithmTraceModal } from '../modals/AlgorithmTraceModal';

export const AnalyticsDrawer: React.FC = () => {
  const {
    activeResult,
    baselineResult,
    selectedAlgorithm,
    setIsMatrixModalOpen,
  } = useEcoRoute();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'impact' | 'itinerary' | 'algorithms'>('impact');
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const savingsPct =
    activeResult && baselineResult && baselineResult.totalDistanceMeters > 0
      ? Math.max(
          0,
          ((baselineResult.totalDistanceMeters - activeResult.totalDistanceMeters) /
            baselineResult.totalDistanceMeters) *
            100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="w-full bg-white border-t border-slate-200/90 shadow-xl transition-all duration-300 z-30">
      {/* Header bar / Mini summary */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50/80 border-b border-slate-200/60 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span>Analytics & Route Intelligence</span>
          </button>

          {activeResult && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">
                {selectedAlgorithm === 'branch-and-bound'
                  ? 'Branch & Bound (Exact)'
                  : 'Nearest Neighbor (Greedy)'}
                :
              </span>
              <span className="font-bold text-emerald-700">
                {formatDistance(activeResult.totalDistanceMeters)}
              </span>
              {Number(savingsPct) > 0 && (
                <span className="flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  -{savingsPct}% vs baseline
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab Controls (when expanded) */}
        <div className="flex items-center gap-1">
          {isExpanded && (
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg mr-2">
              <button
                onClick={() => setActiveTab('impact')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'impact'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Sustainability Impact</span>
              </button>

              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'itinerary'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Collection Itinerary</span>
              </button>

              <button
                onClick={() => setActiveTab('algorithms')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'algorithms'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Algorithm Benchmark</span>
              </button>
            </div>
          )}

          {/* Pairwise Distance Matrix Modal Trigger */}
          <button
            onClick={() => setIsTraceOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Open presentation algorithm trace"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Algorithm Trace</span>
          </button>

          {/* Pairwise Distance Matrix Modal Trigger */}
          <button
            onClick={() => setIsMatrixModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Inspect Pairwise Distance Matrix"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Distance Matrix</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="p-4 max-h-72 overflow-y-auto bg-slate-50/30">
          {activeTab === 'impact' && <SustainabilityCard />}
          {activeTab === 'itinerary' && <RouteStepTable />}
          {activeTab === 'algorithms' && <ComparisonChart />}
        </div>
      )}
      {isTraceOpen && <AlgorithmTraceModal onClose={() => setIsTraceOpen(false)} />}
    </div>
  );
};
