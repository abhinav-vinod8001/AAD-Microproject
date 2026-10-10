import type { WasteBin } from './map';

export type AlgorithmType = 'nearest-neighbor' | 'branch-and-bound' | 'baseline';

export interface TSPStop {
  index: number;
  id: string;
  label: string;
  x: number;
  y: number;
  isDepot: boolean;
  wasteKg: number;
  type?: string;
  bin?: WasteBin;
  nearestNodeId?: string;
  nearestEdgeId?: string;
}

export interface DistanceMatrixData {
  stops: TSPStop[];
  matrix: number[][]; // symmetric/asymmetric distance in meters
  paths?: Record<string, {x: number, y: number}[]>; // path coordinates for visual animation
  isCustomized?: boolean;
}

export interface TSPResult {
  algorithm: AlgorithmType;
  algorithmName: string;
  tour: number[]; // Indices matching stops array, e.g. [0, 3, 1, 4, ..., 0]
  stopSequence: TSPStop[];
  totalDistanceMeters: number;
  executionTimeMs: number;
  nodesExplored: number;
  prunedBranches: number;
  isOptimal: boolean;
  stoppedEarly: boolean;
  statusMessage?: string;
  timestamp: number;
}

export interface SustainabilityMetrics {
  fuelEfficiencyLPer100Km: number; // e.g. 28.5 L/100km
  emissionFactorKgPerL: number;    // e.g. 2.68 kg CO2/L
  estimatedFuelLiters: number;
  estimatedCO2Kg: number;
  baselineDistanceMeters: number;
  distanceSavedMeters: number;
  percentageSaved: number;
  fuelSavedLiters: number;
  co2SavedKg: number;
}
