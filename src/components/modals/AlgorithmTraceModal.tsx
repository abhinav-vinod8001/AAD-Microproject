import React from 'react';
import { Terminal, X, Circle } from 'lucide-react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { formatDistance, formatWeight } from '../../utils/geometry';

interface AlgorithmTraceModalProps {
  onClose: () => void;
}

/** A presentation-friendly audit console. It reports cached shortest paths and live simulation state. */
export const AlgorithmTraceModal: React.FC<AlgorithmTraceModalProps> = ({ onClose }) => {
  const { activeResult, distanceMatrixData, simulation, town, selectedAlgorithm } = useEcoRoute();
  const activeBins = town.bins.filter((bin) => bin.fillPercent >= 40);
  const skippedBins = town.bins.filter((bin) => bin.fillPercent < 40);
  const stops = activeResult?.stopSequence ?? [];
  const shortestPathQueries = activeBins.length * (activeBins.length + 1);
  let runningDistance = 0;
  let plannedLoad = 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <section className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-700 bg-[#07111f] shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-3">
          <div className="flex items-center gap-3 text-emerald-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold tracking-wide">ECOROUTE // ALGORITHM TRACE</h2>
              <p className="font-mono text-[10px] text-slate-400">Presentation console — road graph, TSP decisions, and live truck state</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close algorithm trace">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[calc(88vh-65px)] overflow-auto p-5 font-mono text-xs leading-6 text-slate-300">
          <TraceLine tone="green">[SYSTEM] Road-network optimizer ready. Graph: {town.nodes.length} intersections, {town.edges.length} two-way roads.</TraceLine>
          <TraceLine tone="blue">[INPUT] {activeBins.length} active bins admitted to TSP; {skippedBins.length} green bins excluded (&lt;40% fill).</TraceLine>
          <TraceLine tone="amber">[SHORTEST PATH] Dijkstra precomputation completed for {shortestPathQueries} directed depot/bin and bin/bin pairs.</TraceLine>
          <p className="mb-3 ml-4 text-[10px] text-slate-500">The simulation reuses these cached shortest road paths; it does not invent straight-line travel or recompute after each collection.</p>

          {activeResult ? (
            <>
              <TraceLine tone="purple">[TSP] {selectedAlgorithm === 'branch-and-bound' ? 'Branch & Bound exact search with Prim MST lower bound' : 'Nearest Neighbor greedy selection'} selected.</TraceLine>
              <TraceLine tone="green">[TSP] Tour accepted: {stops.map((stop) => stop.isDepot ? 'DEPOT' : stop.label).join(' → ')}</TraceLine>
              <TraceLine tone="green">[RESULT] Total optimized road distance = {formatDistance(activeResult.totalDistanceMeters)}. {activeResult.isOptimal ? 'Global optimum proven.' : 'Greedy heuristic result.'}</TraceLine>

              <div className="my-4 border-y border-slate-800 py-3">
                <p className="mb-2 text-slate-500"># EXECUTION PLAN (one collection per active bin; road segments may be reused when required)</p>
                {stops.slice(1).map((stop, index) => {
                  const previous = stops[index];
                  const legDistance = distanceMatrixData.matrix[previous.index]?.[stop.index] ?? 0;
                  runningDistance += legDistance;
                  plannedLoad += stop.bin?.wasteKg ?? 0;
                  const pathKey = `${previous.id}-${stop.id}`;
                  const roadPoints = distanceMatrixData.paths?.[pathKey]?.length ?? 0;
                  const isReturn = stop.isDepot;
                  return (
                    <div key={`${previous.id}-${stop.id}-${index}`} className="flex flex-wrap gap-x-2 border-l-2 border-slate-700 pl-3">
                      <span className="text-sky-300">[{String(index + 1).padStart(2, '0')}]</span>
                      <span>DIJKSTRA CACHE</span><span className="text-slate-500">|</span>
                      <span>{previous.isDepot ? 'DEPOT' : previous.label} → {isReturn ? 'DEPOT' : stop.label}</span><span className="text-slate-500">|</span>
                      <span className="text-amber-300">{formatDistance(legDistance)}</span><span className="text-slate-500">|</span>
                      <span>{roadPoints} road points</span>
                      {isReturn ? <span className="text-emerald-300">| return to depot | total {formatDistance(runningDistance)}</span> : <span className="text-emerald-300">| collect {formatWeight(stop.bin?.wasteKg ?? 0)} | load {formatWeight(plannedLoad)}</span>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : <TraceLine tone="amber">[WAITING] Run an optimization to generate the route trace.</TraceLine>}

          <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/25 p-3">
            <p className="mb-1 text-emerald-400"># LIVE SIMULATION STATUS</p>
            <p>[LIVE] {simulation.message}</p>
            <p>[LIVE] Leg {simulation.currentLegIndex + 1} | collected {simulation.collectedBinIds.length}/{activeBins.length} bins | loaded {formatWeight(simulation.currentWasteLoadedKg)}</p>
            {simulation.collectedBinIds.length > 0 && <p className="text-emerald-300">[LIVE] Completed pickups: {town.bins.filter((bin) => simulation.collectedBinIds.includes(bin.id)).map((bin) => bin.label).join(', ')}</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

const TraceLine: React.FC<{ children: React.ReactNode; tone: 'green' | 'blue' | 'amber' | 'purple' }> = ({ children, tone }) => {
  const colors = { green: 'text-emerald-300', blue: 'text-sky-300', amber: 'text-amber-300', purple: 'text-violet-300' };
  return <p className={`flex items-start gap-2 ${colors[tone]}`}><Circle className="mt-2 h-1.5 w-1.5 shrink-0 fill-current" />{children}</p>;
};
