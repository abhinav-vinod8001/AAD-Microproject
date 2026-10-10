import type { DistanceMatrixData, TSPResult } from '../types/tsp';
import { calculateTourDistance } from './distanceMatrix';

/**
 * Nearest Neighbor TSP Heuristic:
 * Starts at the depot (stop 0), iteratively visits the closest unvisited stop,
 * and returns to the depot when all stops have been visited.
 * Time complexity: O(n^2), space complexity: O(n).
 */
export function solveNearestNeighbor(data: DistanceMatrixData): TSPResult {
  const startTime = performance.now();
  const { stops, matrix } = data;
  const n = stops.length;

  if (n <= 1) {
    return {
      algorithm: 'nearest-neighbor',
      algorithmName: 'Nearest Neighbor (Greedy)',
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

  const visited = new Array(n).fill(false);
  const tour: number[] = [0];
  visited[0] = true;
  let current = 0;
  let nodesExplored = 1;

  for (let step = 1; step < n; step++) {
    let nearestNode = -1;
    let shortestDistance = Infinity;

    for (let candidate = 0; candidate < n; candidate++) {
      if (!visited[candidate]) {
        const dist = matrix[current][candidate];
        if (dist < shortestDistance) {
          shortestDistance = dist;
          nearestNode = candidate;
        }
      }
    }

    if (nearestNode !== -1) {
      tour.push(nearestNode);
      visited[nearestNode] = true;
      current = nearestNode;
      nodesExplored++;
    }
  }

  // Return to Depot (index 0)
  tour.push(0);

  const endTime = performance.now();
  const totalDistanceMeters = calculateTourDistance(tour, matrix);

  return {
    algorithm: 'nearest-neighbor',
    algorithmName: 'Nearest Neighbor (Greedy)',
    tour,
    stopSequence: tour.map((idx) => stops[idx]),
    totalDistanceMeters,
    executionTimeMs: Math.max(0.01, Number((endTime - startTime).toFixed(3))),
    nodesExplored,
    prunedBranches: 0,
    isOptimal: false, // Heuristic does not guarantee optimality
    stoppedEarly: false,
    statusMessage: `Greedy tour visiting ${n - 1} bins computed in ${(endTime - startTime).toFixed(2)}ms`,
    timestamp: Date.now(),
  };
}
