import type { TownData } from '../types/map';
import type { VehicleSettings } from '../types/simulation';
import { SEEDED_TOWN } from '../data/seedTown';

const TOWN_STORAGE_KEY = 'ecoroute_town_data_v2';
const SETTINGS_STORAGE_KEY = 'ecoroute_settings_v1';

export const DEFAULT_VEHICLE_SETTINGS: VehicleSettings = {
  fuelEfficiencyLPer100Km: 28.5,
  emissionFactorKgPerL: 2.68,
  truckCapacityKg: 1200,
  truckSpeedMetersPerSec: 15,
};

export function loadSavedTown(): TownData {
  try {
    const raw = localStorage.getItem(TOWN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.depot && Array.isArray(parsed.bins) && Array.isArray(parsed.nodes)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load saved town from localStorage:', err);
  }
  return JSON.parse(JSON.stringify(SEEDED_TOWN));
}

export function saveTownToStorage(town: TownData): void {
  try {
    localStorage.setItem(TOWN_STORAGE_KEY, JSON.stringify(town));
  } catch (err) {
    console.error('Failed to save town to localStorage:', err);
  }
}

export function resetTownToDemo(): TownData {
  const fresh = JSON.parse(JSON.stringify(SEEDED_TOWN));
  saveTownToStorage(fresh);
  return fresh;
}

export function loadSavedSettings(): VehicleSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_VEHICLE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load saved settings:', err);
  }
  return { ...DEFAULT_VEHICLE_SETTINGS };
}

export function saveSettingsToStorage(settings: VehicleSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportTownToFile(town: TownData): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(town, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${town.name.toLowerCase().replace(/\s+/g, '_')}_ecoroute.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateTownData(data: any): data is TownData {
  return Boolean(
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    data.depot &&
    typeof data.depot.x === 'number' &&
    typeof data.depot.y === 'number' &&
    Array.isArray(data.bins) &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges)
  );
}
