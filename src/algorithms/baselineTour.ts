import type { DistanceMatrixData, SustainabilityMetrics, TSPResult } from '../types/tsp';
import type { VehicleSettings } from '../types/simulation';
import { calculateTourDistance } from './distanceMatrix';

/**
 * Computes the baseline (unoptimized sequential) collection tour:
 * Visits stops in their natural order 0 -> 1 -> 2 -> ... -> N-1 -> 0.
 */
export function solveBaselineTour(data: DistanceMatrixData): TSPResult {
  const startTime = performance.now();
  const { stops, matrix } = data;
  const n = stops.length;

  if (n <= 1) {
    return {
      algorithm: 'baseline',
      algorithmName: 'Baseline Tour (Unoptimized)',
      tour: [0, 0],
      stopSequence: [stops[0], stops[0]],
      totalDistanceMeters: 0,
      executionTimeMs: 0,
      nodesExplored: 1,
      prunedBranches: 0,
      isOptimal: false,
      stoppedEarly: false,
      timestamp: Date.now(),
    };
  }

  const tour: number[] = [0];
  for (let i = 1; i < n; i++) {
    tour.push(i);
  }
  tour.push(0);

  const totalDistanceMeters = calculateTourDistance(tour, matrix);
  const endTime = performance.now();

  return {
    algorithm: 'baseline',
    algorithmName: 'Baseline Tour (Unoptimized)',
    tour,
    stopSequence: tour.map((idx) => stops[idx]),
    totalDistanceMeters,
    executionTimeMs: Math.max(0.01, Number((endTime - startTime).toFixed(3))),
    nodesExplored: n,
    prunedBranches: 0,
    isOptimal: false,
    stoppedEarly: false,
    statusMessage: `Sequential baseline order: ${totalDistanceMeters}m`,
    timestamp: Date.now(),
  };
}

/**
 * Calculates sustainability and efficiency improvements against baseline.
 */
export function calculateSustainabilityImpact(
  optimizedResult: TSPResult,
  baselineResult: TSPResult,
  settings: VehicleSettings
): SustainabilityMetrics {
  const baselineDistM = baselineResult.totalDistanceMeters;
  const optDistM = optimizedResult.totalDistanceMeters;

  const distanceSavedM = Math.max(0, baselineDistM - optDistM);
  const percentageSaved = baselineDistM > 0 ? (distanceSavedM / baselineDistM) * 100 : 0;

  // Fuel consumption: Distance (km) * (L / 100km)
  const optDistanceKm = optDistM / 1000;
  const estimatedFuelLiters = (optDistanceKm * settings.fuelEfficiencyLPer100Km) / 100;
  const estimatedCO2Kg = estimatedFuelLiters * settings.emissionFactorKgPerL;

  const distanceSavedKm = distanceSavedM / 1000;
  const fuelSavedLiters = (distanceSavedKm * settings.fuelEfficiencyLPer100Km) / 100;
  const co2SavedKg = fuelSavedLiters * settings.emissionFactorKgPerL;

  return {
    fuelEfficiencyLPer100Km: settings.fuelEfficiencyLPer100Km,
    emissionFactorKgPerL: settings.emissionFactorKgPerL,
    estimatedFuelLiters: Number(estimatedFuelLiters.toFixed(2)),
    estimatedCO2Kg: Number(estimatedCO2Kg.toFixed(2)),
    baselineDistanceMeters: baselineDistM,
    distanceSavedMeters: distanceSavedM,
    percentageSaved: Number(percentageSaved.toFixed(1)),
    fuelSavedLiters: Number(fuelSavedLiters.toFixed(2)),
    co2SavedKg: Number(co2SavedKg.toFixed(2)),
  };
}
