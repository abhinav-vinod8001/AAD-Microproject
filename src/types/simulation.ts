export type SimulationStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface SimulationState {
  status: SimulationStatus;
  currentLegIndex: number;
  legProgress: number; // 0.0 to 1.0
  truckPosition: { x: number; y: number };
  truckAngle: number; // in degrees
  collectedBinIds: string[];
  currentWasteLoadedKg: number;
  speedMultiplier: number;
  isPausingAtBin: boolean;
  activeStopIndex: number;
  message: string;
}

export interface VehicleSettings {
  fuelEfficiencyLPer100Km: number;
  emissionFactorKgPerL: number;
  truckCapacityKg: number;
  truckSpeedMetersPerSec: number;
}
