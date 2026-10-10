import type { DistanceMatrixData, TSPResult } from '../types/tsp';
import { calculateTourDistance } from './distanceMatrix';
import { solveNearestNeighbor } from './nearestNeighbor';

/**
 * Calculates the Minimum Spanning Tree (MST) weight of a subset of vertices
 * using Prim's algorithm. Time complexity: O(|U|^2).
 */
function calculateMSTWeight(subset: number[], matrix: number[][]): number {
  const k = subset.length;
  if (k <= 1) return 0;

  const inMST = new Array(k).fill(false);
  const minEdge = new Array(k).fill(Infinity);

  // Start with first vertex in subset
  minEdge[0] = 0;
  let totalWeight = 0;

  for (let i = 0; i < k; i++) {
    let u = -1;
    let minDist = Infinity;

    for (let j = 0; j < k; j++) {
      if (!inMST[j] && minEdge[j] < minDist) {
        minDist = minEdge[j];
        u = j;
      }
    }

    if (u === -1) break;
    inMST[u] = true;
    totalWeight += minDist;

    const uNode = subset[u];
    for (let v = 0; v < k; v++) {
      if (!inMST[v]) {
        const vNode = subset[v];
        const weight = matrix[uNode][vNode];
        if (weight < minEdge[v]) {
          minEdge[v] = weight;
        }
      }
    }
  }

  return totalWeight;
}

/**
 * Computes the 1-Tree / MST-based admissible Lower Bound for TSP.
 * LB = currentCost + minEdge(lastNode -> U) + MST(U) + minEdge(U -> Depot).
 */
function computeLowerBound(
  currentCost: number,
  lastNode: number,
  unvisited: number[],
  matrix: number[][]
): number {
  if (unvisited.length === 0) {
    return currentCost + matrix[lastNode][0];
  }

  // 1. Min edge from lastNode to any unvisited vertex
  let minEnter = Infinity;
  for (const u of unvisited) {
    if (matrix[lastNode][u] < minEnter) {
      minEnter = matrix[lastNode][u];
    }
  }

  // 2. MST of unvisited vertices
  const mstCost = calculateMSTWeight(unvisited, matrix);

  // 3. Min edge from any unvisited vertex back to Depot (0)
  let minLeave = Infinity;
  for (const u of unvisited) {
    if (matrix[u][0] < minLeave) {
      minLeave = matrix[u][0];
    }
  }

  return currentCost + minEnter + mstCost + minLeave;
}

export interface BranchAndBoundOptions {
  maxNodesExplored?: number;
  maxTimeMs?: number;
}

/**
 * Branch and Bound Exact TSP Solver:
 * Uses MST-based lower bound relaxation and greedy upper-bounding to prune suboptimal subtrees.
 */
export function solveBranchAndBound(
  data: DistanceMatrixData,
  options: BranchAndBoundOptions = {}
): TSPResult {
  const startTime = performance.now();
  const { stops, matrix } = data;
  const n = stops.length;

  const maxNodes = options.maxNodesExplored ?? 250000;
  const maxTimeMs = options.maxTimeMs ?? 5000;

  if (n <= 1) {
    return {
      algorithm: 'branch-and-bound',
      algorithmName: 'Branch & Bound (Exact)',
      tour: [0, 0],
      stopSequence: [stops[0], stops[0]],
      totalDistanceMeters: 0,
      executionTimeMs: 0,
      nodesExplored: 1,
      prunedBranches: 0,
      isOptimal: true,
      stoppedEarly: false,
      timestamp: Date.now(),
    };
  }

  // Step 1: Use Nearest Neighbor as the initial upper bound
  const nnResult = solveNearestNeighbor(data);
  let bestTour: number[] = [...nnResult.tour];
  let bestCost: number = nnResult.totalDistanceMeters;

  let nodesExplored = 0;
  let prunedBranches = 0;
  let stoppedEarly = false;

  const initialUnvisited = Array.from({ length: n - 1 }, (_, i) => i + 1);

  // Recursive DFS with branch and bound
  function search(currentTour: number[], currentCost: number, unvisited: number[]) {
    nodesExplored++;

    // Safety checks against UI freeze
    if (nodesExplored >= maxNodes || performance.now() - startTime > maxTimeMs) {
      stoppedEarly = true;
      return;
    }

    const lastNode = currentTour[currentTour.length - 1];

    // Base case: all stops visited, return to depot (0)
    if (unvisited.length === 0) {
      const finalCost = currentCost + matrix[lastNode][0];
      if (finalCost < bestCost) {
        bestCost = finalCost;
        bestTour = [...currentTour, 0];
      }
      return;
    }

    // Lower bound check for pruning
    const lb = computeLowerBound(currentCost, lastNode, unvisited, matrix);
    if (lb >= bestCost) {
      prunedBranches++;
      return; // PRUNE this branch
    }

    // Branching: Sort unvisited candidates by distance from lastNode (best-first ordering)
    const sortedCandidates = [...unvisited].sort(
      (a, b) => matrix[lastNode][a] - matrix[lastNode][b]
    );

    for (const nextNode of sortedCandidates) {
      if (stoppedEarly) break;

      const nextCost = currentCost + matrix[lastNode][nextNode];

      // Quick edge-cost cutoff check
      if (nextCost >= bestCost) {
        prunedBranches++;
        continue;
      }

      const nextUnvisited = unvisited.filter((node) => node !== nextNode);
      currentTour.push(nextNode);

      search(currentTour, nextCost, nextUnvisited);

      currentTour.pop(); // Backtrack
    }
  }

  // Execute search starting at Depot [0]
  search([0], 0, initialUnvisited);

  const endTime = performance.now();
  const executionTimeMs = Math.max(0.01, Number((endTime - startTime).toFixed(3)));
  const finalDistance = calculateTourDistance(bestTour, matrix);

  return {
    algorithm: 'branch-and-bound',
    algorithmName: 'Branch & Bound (Exact)',
    tour: bestTour,
    stopSequence: bestTour.map((idx) => stops[idx]),
    totalDistanceMeters: finalDistance,
    executionTimeMs,
    nodesExplored,
    prunedBranches,
    isOptimal: !stoppedEarly,
    stoppedEarly,
    statusMessage: stoppedEarly
      ? `Search stopped after ${nodesExplored.toLocaleString()} nodes (best tour retained: ${finalDistance}m)`
      : `Optimal tour found: ${finalDistance}m (${prunedBranches.toLocaleString()} branches pruned)`,
    timestamp: Date.now(),
  };
}
