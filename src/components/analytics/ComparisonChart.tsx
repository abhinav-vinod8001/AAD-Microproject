import React from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Zap, Play, CheckCircle2 } from 'lucide-react';

export const ComparisonChart: React.FC = () => {
  const {
    baselineResult,
    nearestNeighborResult,
    branchAndBoundResult,
    runFullComparison,
    isComputing,
    town,
  } = useEcoRoute();

  const data = [
    {
      name: 'Baseline (Sequential)',
      distance: baselineResult?.totalDistanceMeters ?? 0,
      time: baselineResult?.executionTimeMs ?? 0.01,
      nodes: baselineResult?.nodesExplored ?? town.bins.length,
      isOptimal: false,
      color: '#94a3b8', // slate-400
    },
    {
      name: 'Nearest Neighbor',
      distance: nearestNeighborResult?.totalDistanceMeters ?? 0,
      time: nearestNeighborResult?.executionTimeMs ?? 0.05,
      nodes: nearestNeighborResult?.nodesExplored ?? town.bins.length,
      isOptimal: false,
      color: '#0284c7', // sky-600
    },
    {
      name: 'Branch & Bound (Exact)',
      distance: branchAndBoundResult?.totalDistanceMeters ?? 0,
      time: branchAndBoundResult?.executionTimeMs ?? 0.2,
      nodes: branchAndBoundResult?.nodesExplored ?? 0,
      pruned: branchAndBoundResult?.prunedBranches ?? 0,
      isOptimal: true,
      color: '#059669', // emerald-600
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner to run full comparison */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-950">
            Compare Greedy Heuristic vs. Exact Branch & Bound
          </span>
          <span className="text-xs text-emerald-700/80 hidden sm:inline">
            (Academic algorithm benchmarking on {town.bins.length} waste stops)
          </span>
        </div>
        <button
          onClick={runFullComparison}
          disabled={isComputing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {isComputing ? 'Computing Solvers...' : 'Run Both Solvers'}
        </button>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Total Route Distance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Route Distance (Meters) - Lower is Better
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Optimal: Branch & Bound
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} meters`, 'Tour Distance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="distance" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Solver Execution Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Execution Time (Milliseconds) - Lower is Faster
            </h4>
            <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded">
              Fastest: Nearest Neighbor
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} ms`, 'Computation Time']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`time-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analysis Table & Academic Callout */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Algorithm Analysis Breakdown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block">Nearest Neighbor (Greedy)</span>
            <span className="text-slate-500 block text-[11px]">Complexity: O(n²)</span>
            <span className="text-slate-500 block text-[11px]">
              Explores {nearestNeighborResult?.nodesExplored ?? town.bins.length} states in{' '}
              {nearestNeighborResult?.executionTimeMs ?? 0}ms.
            </span>
            <span className="text-sky-700 font-semibold block text-[11px] mt-1">
              Ultra-fast greedy tour, good for large maps.
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block">Branch and Bound (Exact)</span>
            <span className="text-slate-500 block text-[11px]">Lower Bound: 1-Tree MST</span>
            <span className="text-slate-500 block text-[11px]">
              Explored: {branchAndBoundResult?.nodesExplored.toLocaleString() ?? 'N/A'} states, pruned{' '}
              {branchAndBoundResult?.prunedBranches.toLocaleString() ?? 'N/A'} subtrees.
            </span>
            <span className="text-emerald-700 font-semibold block text-[11px] mt-1">
              Guaranteed globally minimal tour for ≤14 stops.
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block">Distance Delta</span>
            <span className="text-slate-500 block text-[11px]">
              Baseline: {baselineResult?.totalDistanceMeters ?? 0}m
            </span>
            <span className="text-emerald-700 font-bold block text-[11px]">
              Optimized: {branchAndBoundResult?.totalDistanceMeters ?? nearestNeighborResult?.totalDistanceMeters ?? 0}m
            </span>
            <span className="text-slate-500 block text-[11px] mt-1">
              {branchAndBoundResult && nearestNeighborResult
                ? `B&B improved tour by ${Math.max(0, nearestNeighborResult.totalDistanceMeters - branchAndBoundResult.totalDistanceMeters)}m over greedy.`
                : 'Run comparison to view direct delta.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
