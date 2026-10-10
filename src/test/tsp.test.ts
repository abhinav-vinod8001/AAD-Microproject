import { describe, expect, it } from 'vitest';
import { SEEDED_TOWN } from '../data/seedTown';
import { buildStops, generateDistanceMatrix } from '../algorithms/distanceMatrix';
import { solveNearestNeighbor } from '../algorithms/nearestNeighbor';
import { solveBranchAndBound } from '../algorithms/branchAndBound';
import { solveBaselineTour, calculateSustainabilityImpact } from '../algorithms/baselineTour';
import { getShortestPath } from '../utils/routing';
import type { WasteBin } from '../types/map';

describe('TSP Algorithms & Route Correctness', () => {
  const depot = SEEDED_TOWN.depot;
  const initialBins = SEEDED_TOWN.bins;

  it('builds stops list correctly with Depot at index 0 and bins at 1..N', () => {
    // When filterLowBins is false, all bins are included
    const stops = buildStops(depot, initialBins, false);
    expect(stops).toHaveLength(initialBins.length + 1);
    expect(stops[0].isDepot).toBe(true);
    expect(stops[0].index).toBe(0);
    expect(stops[0].id).toBe(depot.id);

    stops.slice(1).forEach((stop, idx) => {
      expect(stop.isDepot).toBe(false);
      expect(stop.index).toBe(idx + 1);
      expect(stop.id).toBe(initialBins[idx].id);
    });
  });

  it('filters out low-fill bins (< 40% green) by default, only routing yellow and red bins', () => {
    const mixedBins: WasteBin[] = [
      { id: 'B-LOW', label: 'Low Bin', x: 100, y: 100, wasteKg: 10, type: 'organic', fillPercent: 20 },
      { id: 'B-MED', label: 'Med Bin', x: 200, y: 200, wasteKg: 50, type: 'general', fillPercent: 60 },
      { id: 'B-FULL', label: 'Full Bin', x: 300, y: 300, wasteKg: 90, type: 'recyclable', fillPercent: 85 },
    ];
    const stops = buildStops(depot, mixedBins);
    // Depot + Med + Full = 3 stops. Low Bin is excluded!
    expect(stops).toHaveLength(3);
    expect(stops[0].isDepot).toBe(true);
    expect(stops[1].id).toBe('B-MED');
    expect(stops[2].id).toBe('B-FULL');
    expect(stops.find((s) => s.id === 'B-LOW')).toBeUndefined();
  });

  it('generates symmetric distance matrix with zeros on diagonal', () => {
    const stops = buildStops(depot, initialBins);
    const data = generateDistanceMatrix(stops, 2.5);

    expect(data.matrix.length).toBe(stops.length);
    for (let i = 0; i < stops.length; i++) {
      expect(data.matrix[i][i]).toBe(0);
      for (let j = 0; j < stops.length; j++) {
        expect(data.matrix[i][j]).toBe(data.matrix[j][i]);
        expect(data.matrix[i][j]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('uses configured road lengths and returns a route made of road points', () => {
    const depot = { id: 'D', name: 'Depot', x: 0, y: 0, nearestNodeId: 'A' };
    const nodes = [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 100, y: 0 },
      { id: 'C', x: 100, y: 100 },
    ];
    const edges = [
      { id: 'AB', fromNodeId: 'A', toNodeId: 'B', streetName: 'Main', lengthMeters: 900 },
      { id: 'BC', fromNodeId: 'B', toNodeId: 'C', streetName: 'Second', lengthMeters: 100 },
    ];
    const destination = { id: 'BIN', x: 100, y: 50, nearestEdgeId: 'BC' };
    const route = getShortestPath(nodes, edges, depot, destination, 1);

    expect(route.distanceMeters).toBe(950);
    expect(route.path).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }]);
  });

  it('Nearest Neighbor starts at depot, visits all bins uniquely, and returns to depot', () => {
    const stops = buildStops(depot, initialBins, false);
    const data = generateDistanceMatrix(stops, 2.5);
    const result = solveNearestNeighbor(data);

    expect(result.tour.length).toBe(stops.length + 1);
    expect(result.tour[0]).toBe(0); // Starts at depot
    expect(result.tour[result.tour.length - 1]).toBe(0); // Returns to depot

    // Intermediate stops must be a permutation of 1..N
    const visitedBins = result.tour.slice(1, -1);
    expect(visitedBins.length).toBe(initialBins.length);

    const uniqueSet = new Set(visitedBins);
    expect(uniqueSet.size).toBe(initialBins.length);
    for (let i = 1; i <= initialBins.length; i++) {
      expect(uniqueSet.has(i)).toBe(true);
    }

    expect(result.totalDistanceMeters).toBeGreaterThan(0);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('Branch and Bound finds an optimal tour <= Nearest Neighbor tour', () => {
    // Test on a small subset of 5 bins for exact comparison
    const smallBins = initialBins.slice(0, 5);
    const stops = buildStops(depot, smallBins, false);
    const data = generateDistanceMatrix(stops, 2.5);

    const nnResult = solveNearestNeighbor(data);
    const bbResult = solveBranchAndBound(data, { maxNodesExplored: 50000 });

    expect(bbResult.tour[0]).toBe(0);
    expect(bbResult.tour[bbResult.tour.length - 1]).toBe(0);
    expect(bbResult.tour.length).toBe(stops.length + 1);

    // Branch & Bound must be at least as good as or better than Nearest Neighbor
    expect(bbResult.totalDistanceMeters).toBeLessThanOrEqual(nnResult.totalDistanceMeters);
    expect(bbResult.isOptimal).toBe(true);
    expect(bbResult.nodesExplored).toBeGreaterThan(0);
  });

  it('re-indexes and invalidates properly when a bin is added or removed', () => {
    const stops1 = buildStops(depot, initialBins, false);
    const data1 = generateDistanceMatrix(stops1, 2.5);
    expect(data1.matrix.length).toBe(stops1.length);

    // Remove one bin
    const reducedBins = initialBins.slice(0, -1);
    const stops2 = buildStops(depot, reducedBins, false);
    const data2 = generateDistanceMatrix(stops2, 2.5);

    expect(stops2.length).toBe(stops1.length - 1);
    expect(data2.matrix.length).toBe(stops2.length);

    // Add a new custom bin
    const newBin: WasteBin = {
      id: 'BIN-NEW',
      label: 'New Test Bin',
      x: 500,
      y: 500,
      wasteKg: 50,
      type: 'organic',
      fillPercent: 50,
    };
    const expandedBins = [...initialBins, newBin];
    const stops3 = buildStops(depot, expandedBins, false);
    const data3 = generateDistanceMatrix(stops3, 2.5);

    expect(stops3.length).toBe(initialBins.length + 2);
    expect(data3.stops[data3.stops.length - 1].id).toBe('BIN-NEW');
  });

  it('Baseline tour calculates sequential distance and sustainability impact accurately', () => {
    const stops = buildStops(depot, initialBins, false);
    const data = generateDistanceMatrix(stops, 2.5);

    const baselineResult = solveBaselineTour(data);
    const nnResult = solveNearestNeighbor(data);

    expect(baselineResult.tour[0]).toBe(0);
    expect(baselineResult.tour[baselineResult.tour.length - 1]).toBe(0);

    const vehicleSettings = {
      fuelEfficiencyLPer100Km: 28.5,
      emissionFactorKgPerL: 2.68,
      truckCapacityKg: 1000,
      truckSpeedMetersPerSec: 15,
    };

    const impact = calculateSustainabilityImpact(nnResult, baselineResult, vehicleSettings);
    expect(impact.baselineDistanceMeters).toBe(baselineResult.totalDistanceMeters);
    expect(impact.percentageSaved).toBeGreaterThanOrEqual(0);
    expect(impact.co2SavedKg).toBeGreaterThanOrEqual(0);
    expect(impact.fuelSavedLiters).toBeGreaterThanOrEqual(0);
  });
});
