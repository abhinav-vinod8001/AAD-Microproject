import type { Depot, WasteBin, RoadNode, RoadEdge } from '../types/map';
import type { DistanceMatrixData, TSPStop } from '../types/tsp';
import { getShortestPath } from '../utils/routing';

export type BinFillLevel = 'low' | 'medium' | 'full';

export interface BinFillInfo {
  level: BinFillLevel;
  label: string;
  fillColor: string;
  strokeColor: string;
  bgClass: string;
  textClass: string;
  shouldCollect: boolean;
}

/**
 * Categorize waste bin by its fill level:
 * - Low (< 40%): Green (Low waste, skipped by collection truck)
 * - Medium (40% - 74%): Yellow (Medium waste, visited by collection truck)
 * - Full (>= 75%): Red (High waste / urgent, visited by collection truck)
 */
export function getBinFillInfo(fillPercent: number): BinFillInfo {
  if (fillPercent < 40) {
    return {
      level: 'low',
      label: 'Low Waste',
      fillColor: '#10b981', // Green / Emerald-500
      strokeColor: '#047857', // Emerald-700
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      textClass: 'text-emerald-700',
      shouldCollect: false,
    };
  }
  if (fillPercent < 75) {
    return {
      level: 'medium',
      label: 'Medium Waste',
      fillColor: '#f59e0b', // Yellow / Amber-500
      strokeColor: '#b45309', // Amber-700
      bgClass: 'bg-amber-50 text-amber-700 border-amber-300',
      textClass: 'text-amber-700',
      shouldCollect: true,
    };
  }
  return {
    level: 'full',
    label: 'Full / High',
    fillColor: '#ef4444', // Red-500
    strokeColor: '#b91c1c', // Red-700
    bgClass: 'bg-red-50 text-red-700 border-red-300',
    textClass: 'text-red-700',
    shouldCollect: true,
  };
}

export function shouldCollectBin(bin: WasteBin): boolean {
  return getBinFillInfo(bin.fillPercent).shouldCollect;
}

export function buildStops(
  depot: Depot,
  bins: WasteBin[],
  filterLowBins: boolean = true
): TSPStop[] {
  const stops: TSPStop[] = [];

  // Index 0 is always the Depot
  stops.push({
    index: 0,
    id: depot.id,
    label: depot.name || 'Central Sanitation Depot',
    x: depot.x,
    y: depot.y,
    isDepot: true,
    wasteKg: 0,
    type: 'depot',
    nearestNodeId: depot.nearestNodeId,
  });

  // Only bins with medium (yellow) or full (red) fill levels are visited by the truck.
  // Low level bins (green) are completely skipped.
  const eligibleBins = filterLowBins ? bins.filter(shouldCollectBin) : bins;

  eligibleBins.forEach((bin, idx) => {
    stops.push({
      index: idx + 1,
      id: bin.id,
      label: bin.label || `Bin ${bin.id}`,
      x: bin.x,
      y: bin.y,
      isDepot: false,
      wasteKg: bin.wasteKg,
      type: bin.type,
      bin,
      nearestEdgeId: bin.nearestEdgeId,
    });
  });

  return stops;
}

export function generateDistanceMatrix(
  stops: TSPStop[],
  townOrScale: number | { nodes: RoadNode[]; edges: RoadEdge[]; scaleMetersPerUnit: number },
  _overrides?: Record<string, number>
): DistanceMatrixData {
  const isScaleOnly = typeof townOrScale === 'number';
  const scale = isScaleOnly ? townOrScale : townOrScale.scaleMetersPerUnit;
  const nodes = isScaleOnly ? [] : townOrScale.nodes;
  const edges = isScaleOnly ? [] : townOrScale.edges;

  const n = stops.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const paths: Record<string, { x: number; y: number }[]> = {};

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
        continue;
      }

      const overrideKey = `${stops[i].id}-${stops[j].id}`;
      // A TSP cost must describe the same route shown on the map. Manual
      // pairwise overrides used to change the number while drawing a straight
      // line, producing impossible tours; all calculations now use the road
      // network's declared lengths.
      const { distanceMeters, path } = getShortestPath(nodes, edges, stops[i], stops[j], scale);
      matrix[i][j] = Math.round(distanceMeters);
      paths[overrideKey] = path;
    }
  }

  return {
    stops,
    matrix,
    paths,
    isCustomized: false,
  };
}

export function calculateTourDistance(tour: number[], matrix: number[][]): number {
  if (tour.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    const from = tour[i];
    const to = tour[i + 1];
    if (matrix[from] && matrix[from][to] !== undefined) {
      total += matrix[from][to];
    }
  }
  return total;
}
