import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { RoadEdge, RoadNode, TownData, WasteBin } from '../types/map';
import type { AlgorithmType, DistanceMatrixData, TSPResult } from '../types/tsp';
import type { SimulationState, VehicleSettings } from '../types/simulation';
import {
  loadSavedSettings,
  loadSavedTown,
  resetTownToDemo,
  saveSettingsToStorage,
  saveTownToStorage,
} from '../utils/storage';
import { buildStops, generateDistanceMatrix } from '../algorithms/distanceMatrix';
import { solveNearestNeighbor } from '../algorithms/nearestNeighbor';
import { solveBranchAndBound } from '../algorithms/branchAndBound';
import { solveBaselineTour } from '../algorithms/baselineTour';
import { euclideanDistance, findNearestRoadEdge } from '../utils/geometry';
import confetti from 'canvas-confetti';

export type AppMode = 'edit-map' | 'manage-bins' | 'view-route';

interface EcoRouteContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  town: TownData;
  setTown: React.Dispatch<React.SetStateAction<TownData>>;
  settings: VehicleSettings;
  updateSettings: (newSettings: Partial<VehicleSettings>) => void;

  // Selection & Interactivity
  selectedBin: WasteBin | null;
  setSelectedBin: (bin: WasteBin | null) => void;
  selectedEdge: RoadEdge | null;
  setSelectedEdge: (edge: RoadEdge | null) => void;
  selectedNode: RoadNode | null;
  setSelectedNode: (node: RoadNode | null) => void;
  connectingFromNode: RoadNode | null;
  setConnectingFromNode: (node: RoadNode | null) => void;

  // Modals
  isMatrixModalOpen: boolean;
  setIsMatrixModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // TSP Optimization
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (algo: AlgorithmType) => void;
  activeResult: TSPResult | null;
  nearestNeighborResult: TSPResult | null;
  branchAndBoundResult: TSPResult | null;
  baselineResult: TSPResult | null;
  distanceMatrixData: DistanceMatrixData;
  distanceOverrides: Record<string, number>;
  isComputing: boolean;
  needsRecalculation: boolean;
  runOptimization: (algo?: AlgorithmType) => void;
  runFullComparison: () => void;
  updateDistanceOverride: (fromId: string, toId: string, dist: number) => void;
  resetDistanceOverrides: () => void;

  // Map Operations
  addNode: (x: number, y: number) => RoadNode;
  updateNode: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;
  addEdge: (fromNodeId: string, toNodeId: string, streetName?: string, lengthMeters?: number) => RoadEdge | null;
  updateEdge: (id: string, updates: Partial<RoadEdge>) => void;
  deleteEdge: (id: string) => void;
  addBin: (binData: Partial<WasteBin> & { x: number; y: number }) => WasteBin;
  updateBin: (id: string, updates: Partial<WasteBin>) => void;
  setBinFillLevel: (id: string, fillPercent: number) => void;
  batchSetBinLevels: (preset: 'smart-mix' | 'all-full' | 'all-medium' | 'all-low' | 'random') => void;
  deleteBin: (id: string) => void;
  updateDepotPosition: (x: number, y: number) => void;
  resetDemo: () => void;
  loadTownData: (data: TownData) => void;

  // Simulation
  simulation: SimulationState;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
}

const EcoRouteContext = createContext<EcoRouteContextType | undefined>(undefined);

export const EcoRouteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('view-route');
  const [town, setTown] = useState<TownData>(loadSavedTown);
  const [settings, setSettings] = useState<VehicleSettings>(loadSavedSettings);

  const [selectedBin, setSelectedBin] = useState<WasteBin | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<RoadEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadNode | null>(null);
  const [connectingFromNode, setConnectingFromNode] = useState<RoadNode | null>(null);

  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('nearest-neighbor');
  const [activeResult, setActiveResult] = useState<TSPResult | null>(null);
  const [nearestNeighborResult, setNearestNeighborResult] = useState<TSPResult | null>(null);
  const [branchAndBoundResult, setBranchAndBoundResult] = useState<TSPResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<TSPResult | null>(null);
  const [distanceOverrides, setDistanceOverrides] = useState<Record<string, number>>({});
  const [isComputing, setIsComputing] = useState(false);
  const [needsRecalculation, setNeedsRecalculation] = useState(true);

  // Simulation State
  const [simulation, setSimulation] = useState<SimulationState>({
    status: 'idle',
    currentLegIndex: 0,
    legProgress: 0,
    truckPosition: { x: town.depot.x, y: town.depot.y },
    truckAngle: 0,
    collectedBinIds: [],
    currentWasteLoadedKg: 0,
    speedMultiplier: 1,
    isPausingAtBin: false,
    activeStopIndex: 0,
    message: 'Simulation ready at Depot',
  });

  const animFrameRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);

  // Compute stops and distance matrix whenever town bins/depot or distance overrides change
  const currentStops = buildStops(town.depot, town.bins);
  const distanceMatrixData = generateDistanceMatrix(currentStops, town, distanceOverrides);

  // Invalidate previous results when bins or depot change
  const markDirty = useCallback(() => {
    setNeedsRecalculation(true);
    resetSimulationState();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    saveTownToStorage(town);
  }, [town]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<VehicleSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Run initial TSP calculation on mount
  useEffect(() => {
    runOptimization('nearest-neighbor');
  }, []);

  // Reset simulation state helper
  const resetSimulationState = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setSimulation((prev) => ({
      ...prev,
      status: 'idle',
      currentLegIndex: 0,
      legProgress: 0,
      truckPosition: { x: town.depot.x, y: town.depot.y },
      truckAngle: 0,
      collectedBinIds: [],
      currentWasteLoadedKg: 0,
      isPausingAtBin: false,
      activeStopIndex: 0,
      message: 'Simulation ready at Depot',
    }));
  }, [town.depot.x, town.depot.y]);

  // Solver execution
  const runOptimization = useCallback(
    (algo: AlgorithmType = selectedAlgorithm) => {
      setIsComputing(true);
      resetSimulationState();

      // Defer slightly so browser renders computing badge
      setTimeout(() => {
        try {
          const stops = buildStops(town.depot, town.bins);
          const matrixData = generateDistanceMatrix(stops, town, distanceOverrides);

          const baseRes = solveBaselineTour(matrixData);
          setBaselineResult(baseRes);

          let res: TSPResult;
          if (algo === 'branch-and-bound') {
            res = solveBranchAndBound(matrixData, { maxNodesExplored: 250000 });
            setBranchAndBoundResult(res);
          } else {
            res = solveNearestNeighbor(matrixData);
            setNearestNeighborResult(res);
          }

          setActiveResult(res);
          setSelectedAlgorithm(algo);
          setNeedsRecalculation(false);
        } catch (err) {
          console.error('Error running TSP optimization:', err);
        } finally {
          setIsComputing(false);
        }
      }, 50);
    },
    [town.depot, town.bins, town.scaleMetersPerUnit, distanceOverrides, selectedAlgorithm, resetSimulationState]
  );

  const runFullComparison = useCallback(() => {
    setIsComputing(true);
    resetSimulationState();

    setTimeout(() => {
      try {
        const stops = buildStops(town.depot, town.bins);
        const matrixData = generateDistanceMatrix(stops, town, distanceOverrides);

        const baseRes = solveBaselineTour(matrixData);
        const nnRes = solveNearestNeighbor(matrixData);
        const bbRes = solveBranchAndBound(matrixData, { maxNodesExplored: 250000 });

        setBaselineResult(baseRes);
        setNearestNeighborResult(nnRes);
        setBranchAndBoundResult(bbRes);

        // Set the superior one (Branch & Bound) as active
        setActiveResult(bbRes);
        setSelectedAlgorithm('branch-and-bound');
        setNeedsRecalculation(false);

        // Confetti when comparison completes!
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Comparison solver error:', err);
      } finally {
        setIsComputing(false);
      }
    }, 50);
  }, [town.depot, town.bins, town.scaleMetersPerUnit, distanceOverrides, resetSimulationState]);

  const updateDistanceOverride = (fromId: string, toId: string, dist: number) => {
    const key = `${fromId}-${toId}`;
    setDistanceOverrides((prev) => ({ ...prev, [key]: dist }));
    markDirty();
  };

  const resetDistanceOverrides = () => {
    setDistanceOverrides({});
    markDirty();
  };

  // Map Operations
  const addNode = (x: number, y: number): RoadNode => {
    const newNode: RoadNode = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: Math.round(x),
      y: Math.round(y),
      label: `Intersection ${town.nodes.length + 1}`,
    };
    setTown((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    return newNode;
  };

  const updateNode = (id: string, x: number, y: number) => {
    setTown((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n)),
    }));
    markDirty();
  };

  const deleteNode = (id: string) => {
    setTown((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.fromNodeId !== id && e.toNodeId !== id),
    }));
    markDirty();
    if (selectedNode?.id === id) setSelectedNode(null);
    if (connectingFromNode?.id === id) setConnectingFromNode(null);
  };

  const addEdge = (fromNodeId: string, toNodeId: string, streetName?: string, lengthMeters?: number): RoadEdge | null => {
    if (fromNodeId === toNodeId) return null;
    const exists = town.edges.some(
      (e) => (e.fromNodeId === fromNodeId && e.toNodeId === toNodeId) || (e.fromNodeId === toNodeId && e.toNodeId === fromNodeId)
    );
    if (exists) return null;

    const fromNode = town.nodes.find((n) => n.id === fromNodeId);
    const toNode = town.nodes.find((n) => n.id === toNodeId);
    if (!fromNode || !toNode) return null;

    const calcLength = lengthMeters ?? Math.round(euclideanDistance(fromNode, toNode) * town.scaleMetersPerUnit);

    const newEdge: RoadEdge = {
      id: `edge-${Date.now()}`,
      fromNodeId,
      toNodeId,
      streetName: streetName || `Road ${town.edges.length + 1}`,
      lengthMeters: calcLength,
    };

    setTown((prev) => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));
    markDirty();
    return newEdge;
  };

  const updateEdge = (id: string, updates: Partial<RoadEdge>) => {
    setTown((prev) => ({
      ...prev,
      edges: prev.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    markDirty();
  };

  const deleteEdge = (id: string) => {
    setTown((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== id),
    }));
    markDirty();
    if (selectedEdge?.id === id) setSelectedEdge(null);
  };

  const addBin = (binData: Partial<WasteBin> & { x: number; y: number }): WasteBin => {
    let maxBinNum = 100;
    town.bins.forEach(b => {
      const match = b.label.match(/Bin #(\d+)/);
      if (match && parseInt(match[1]) > maxBinNum) {
        maxBinNum = parseInt(match[1]);
      }
    });
    const nextNum = maxBinNum + 1;

    // Snap to nearest road edge if available
    const { edge } = findNearestRoadEdge({ x: binData.x, y: binData.y }, town.edges, town.nodes);

    const snappedPosition = edge
      ? findNearestRoadEdge({ x: binData.x, y: binData.y }, [edge], town.nodes).snappedPoint
      : binData;
    const newBin: WasteBin = {
      id: `BIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: binData.label || `Bin #${nextNum}`,
      x: Math.round(snappedPosition.x),
      y: Math.round(snappedPosition.y),
      wasteKg: binData.wasteKg ?? 50,
      type: binData.type ?? 'organic',
      fillPercent: binData.fillPercent ?? 75,
      nearestEdgeId: edge?.id,
    };

    setTown((prev) => ({
      ...prev,
      bins: [...prev.bins, newBin],
    }));

    markDirty();
    return newBin;
  };

  const updateBin = (id: string, updates: Partial<WasteBin>) => {
    const existing = town.bins.find((bin) => bin.id === id);
    let normalizedUpdates = updates;
    if (existing && (updates.x !== undefined || updates.y !== undefined)) {
      const snap = findNearestRoadEdge({ x: updates.x ?? existing.x, y: updates.y ?? existing.y }, town.edges, town.nodes);
      if (snap.edge) {
        normalizedUpdates = { ...updates, x: Math.round(snap.snappedPoint.x), y: Math.round(snap.snappedPoint.y), nearestEdgeId: snap.edge.id };
      }
    }
    setTown((prev) => ({
      ...prev,
      bins: prev.bins.map((b) => (b.id === id ? { ...b, ...normalizedUpdates } : b)),
    }));
    markDirty();
  };

  const setBinFillLevel = (id: string, fillPercent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(fillPercent)));
    setTown((prev) => ({
      ...prev,
      bins: prev.bins.map((b) => (b.id === id ? { ...b, fillPercent: clamped } : b)),
    }));
    markDirty();
  };

  const batchSetBinLevels = (preset: 'smart-mix' | 'all-full' | 'all-medium' | 'all-low' | 'random') => {
    setTown((prev) => {
      const updatedBins = prev.bins.map((b, idx) => {
        let fillPercent = b.fillPercent;
        if (preset === 'all-full') {
          fillPercent = 85 + (idx % 3) * 5; // 85%, 90%, 95%
        } else if (preset === 'all-medium') {
          fillPercent = 50 + (idx % 4) * 6; // 50%, 56%, 62%, 68%
        } else if (preset === 'all-low') {
          fillPercent = 15 + (idx % 3) * 8; // 15%, 23%, 31%
        } else if (preset === 'random') {
          const rand = Math.random();
          if (rand < 0.3) {
            fillPercent = Math.floor(10 + Math.random() * 25); // 10-35% (Green)
          } else if (rand < 0.65) {
            fillPercent = Math.floor(45 + Math.random() * 25); // 45-70% (Yellow)
          } else {
            fillPercent = Math.floor(75 + Math.random() * 24); // 75-99% (Red)
          }
        } else if (preset === 'smart-mix') {
          const pattern = [85, 90, 68, 58, 95, 62, 98, 24, 30, 84, 18, 52];
          fillPercent = pattern[idx % pattern.length];
        }
        return { ...b, fillPercent };
      });
      return { ...prev, bins: updatedBins };
    });
    markDirty();
    setTimeout(() => {
      runOptimization();
    }, 80);
  };

  const deleteBin = (id: string) => {
    setTown((prev) => ({
      ...prev,
      bins: prev.bins.filter((b) => b.id !== id),
    }));
    if (selectedBin?.id === id) setSelectedBin(null);
    markDirty();
  };

  const updateDepotPosition = (x: number, y: number) => {
    setTown((prev) => ({
      ...prev,
      depot: { ...prev.depot, x: Math.round(x), y: Math.round(y) },
    }));
    markDirty();
  };

  const resetDemo = () => {
    const demo = resetTownToDemo();
    setTown(demo);
    setDistanceOverrides({});
    setSelectedBin(null);
    setSelectedEdge(null);
    setSelectedNode(null);
    setConnectingFromNode(null);
    markDirty();
    setTimeout(() => {
      runOptimization('nearest-neighbor');
    }, 100);
  };

  const loadTownData = (data: TownData) => {
    setTown(data);
    setDistanceOverrides({});
    markDirty();
    setTimeout(() => {
      runOptimization('nearest-neighbor');
    }, 100);
  };

  // Animation Engine
  const startSimulation = () => {
    if (!activeResult || activeResult.tour.length < 2) return;
    const visitedStops = activeResult.stopSequence.filter((s) => !s.isDepot);
    if (visitedStops.length === 0) {
      setSimulation((prev) => ({
        ...prev,
        status: 'completed',
        message: 'All bins are low waste (green). No collection needed! Truck stays at depot.',
      }));
      return;
    }
    setMode('view-route');
    resetSimulationState();
    setSimulation((prev) => ({
      ...prev,
      status: 'playing',
      currentLegIndex: 0,
      legProgress: 0,
      truckPosition: { x: town.depot.x, y: town.depot.y },
      collectedBinIds: [],
      currentWasteLoadedKg: 0,
      message: `Departing Depot to collect ${visitedStops.length} active bins (skipping low-fill green bins)`,
    }));
  };

  const pauseSimulation = () => {
    setSimulation((prev) => ({
      ...prev,
      status: 'paused',
      message: 'Simulation paused',
    }));
  };

  const resumeSimulation = () => {
    if (simulation.status === 'paused') {
      setSimulation((prev) => ({
        ...prev,
        status: 'playing',
        message: 'Resuming route...',
      }));
    }
  };

  const resetSimulation = () => {
    resetSimulationState();
  };

  const setSimulationSpeed = (speed: number) => {
    setSimulation((prev) => ({
      ...prev,
      speedMultiplier: speed,
    }));
  };

  // RequestAnimationFrame simulation loop
  useEffect(() => {
    if (simulation.status !== 'playing' || !activeResult) return;

    let lastTimestamp = performance.now();
    const stops = activeResult.stopSequence;
    const totalLegs = stops.length - 1;

    const tick = (now: number) => {
      const deltaMs = now - lastTimestamp;
      lastTimestamp = now;

      setSimulation((currentSim) => {
        if (currentSim.status !== 'playing') return currentSim;

        if (currentSim.isPausingAtBin) {
          return currentSim; // paused at bin for collection
        }

        const legIdx = currentSim.currentLegIndex;
        if (legIdx >= totalLegs) {
          // Completed route!
          try {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
          } catch {
            // ignore
          }
          return {
            ...currentSim,
            status: 'completed',
            legProgress: 1,
            truckPosition: { x: town.depot.x, y: town.depot.y },
            message: `Collection Complete! All ${currentSim.collectedBinIds.length} bins collected. Truck returned to Depot.`,
          };
        }

        const fromStop = stops[legIdx];
        const toStop = stops[legIdx + 1];
        if (!fromStop || !toStop) return currentSim;

        // Retrieve actual road network path between these two stops
        const overrideKey = `${fromStop.id}-${toStop.id}`;
        const rawLeg = distanceMatrixData?.paths?.[overrideKey];
        const pathPoints = rawLeg && rawLeg.length >= 2 ? rawLeg : [fromStop, toStop];
        
        let totalPathDist = 0;
        const segmentDists: number[] = [];
        for (let i = 0; i < pathPoints.length - 1; i++) {
          const d = Math.hypot(pathPoints[i+1].x - pathPoints[i].x, pathPoints[i+1].y - pathPoints[i].y);
          totalPathDist += d;
          segmentDists.push(d);
        }

        const roadDistanceMeters = distanceMatrixData.matrix[fromStop.index]?.[toStop.index] ?? 0;
        const fallbackDistanceMeters = euclideanDistance(fromStop, toStop) * town.scaleMetersPerUnit;
        const effectiveMeters = roadDistanceMeters || fallbackDistanceMeters;
        // This is a presentation simulator, not a real-time driving model.
        // Keep the real vehicle speed in Settings for reporting, while running
        // the visual trace at 10x so a full city tour is demo-friendly.
        const presentationSpeedMetersPerSec = Math.max(1, settings.truckSpeedMetersPerSec) * 10;
        const durationMs = Math.max(280, (effectiveMeters / presentationSpeedMetersPerSec) * 1000) / currentSim.speedMultiplier;
        const progressIncrement = deltaMs / durationMs;
        const nextProgress = currentSim.legProgress + progressIncrement;

        if (nextProgress < 1.0) {
          // Find current position along the multi-segment path
          let targetDist = nextProgress * totalPathDist;
          let currentX = pathPoints[0].x;
          let currentY = pathPoints[0].y;
          let angle = currentSim.truckAngle;

          for (let i = 0; i < segmentDists.length; i++) {
            if (targetDist <= segmentDists[i]) {
              const segT = segmentDists[i] > 0 ? targetDist / segmentDists[i] : 1;
              const p1 = pathPoints[i] || pathPoints[0];
              const p2 = pathPoints[i+1] || p1;
              currentX = p1.x + (p2.x - p1.x) * segT;
              currentY = p1.y + (p2.y - p1.y) * segT;
              angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
              break;
            }
            targetDist -= segmentDists[i];
          }

          return {
            ...currentSim,
            legProgress: nextProgress,
            truckPosition: { x: currentX, y: currentY },
            truckAngle: angle,
            message: `En route to ${toStop.label} (${Math.round((1 - nextProgress) * effectiveMeters)}m away)`,
          };
        } else {
          // Arrived at toStop!
          const isReturningToDepot = toStop.isDepot;
          const newlyCollectedId = !isReturningToDepot && toStop.bin ? toStop.bin.id : null;
          const wasteToAdd = toStop.bin ? toStop.bin.wasteKg : 0;

          const updatedCollected = newlyCollectedId && !currentSim.collectedBinIds.includes(newlyCollectedId)
            ? [...currentSim.collectedBinIds, newlyCollectedId]
            : currentSim.collectedBinIds;

          const updatedWaste = currentSim.currentWasteLoadedKg + wasteToAdd;

          if (!isReturningToDepot) {
            // Pause at bin for collection
            const pauseDurationMs = 360 / currentSim.speedMultiplier;
            pauseTimerRef.current = window.setTimeout(() => {
              setSimulation((sim) => ({
                ...sim,
                isPausingAtBin: false,
                currentLegIndex: sim.currentLegIndex + 1,
                legProgress: 0,
                message: `Loaded ${wasteToAdd}kg from ${toStop.label}. Next stop...`,
              }));
            }, pauseDurationMs);

            return {
              ...currentSim,
              legProgress: 1,
              truckPosition: { x: toStop.x, y: toStop.y },
              isPausingAtBin: true,
              collectedBinIds: updatedCollected,
              currentWasteLoadedKg: updatedWaste,
              message: `Emptying ${toStop.label} (${wasteToAdd} kg ${toStop.bin?.type} waste)...`,
            };
          } else {
            // Next is depot return
            return {
              ...currentSim,
              currentLegIndex: currentSim.currentLegIndex + 1,
              legProgress: 0,
              truckPosition: { x: toStop.x, y: toStop.y },
              message: 'Returning to Central Depot...',
            };
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [simulation.status, simulation.speedMultiplier, activeResult, distanceMatrixData, settings.truckSpeedMetersPerSec, town.depot.x, town.depot.y, town.scaleMetersPerUnit]);

  return (
    <EcoRouteContext.Provider
      value={{
        mode,
        setMode,
        town,
        setTown,
        settings,
        updateSettings,
        selectedBin,
        setSelectedBin,
        selectedEdge,
        setSelectedEdge,
        selectedNode,
        setSelectedNode,
        connectingFromNode,
        setConnectingFromNode,
        isMatrixModalOpen,
        setIsMatrixModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        selectedAlgorithm,
        setSelectedAlgorithm,
        activeResult,
        nearestNeighborResult,
        branchAndBoundResult,
        baselineResult,
        distanceMatrixData,
        distanceOverrides,
        isComputing,
        needsRecalculation,
        runOptimization,
        runFullComparison,
        updateDistanceOverride,
        resetDistanceOverrides,
        addNode,
        updateNode,
        deleteNode,
        addEdge,
        updateEdge,
        deleteEdge,
        addBin,
        updateBin,
        setBinFillLevel,
        batchSetBinLevels,
        deleteBin,
        updateDepotPosition,
        resetDemo,
        loadTownData,
        simulation,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        setSimulationSpeed,
      }}
    >
      {children}
    </EcoRouteContext.Provider>
  );
};

export const useEcoRoute = () => {
  const context = useContext(EcoRouteContext);
  if (!context) {
    throw new Error('useEcoRoute must be used within an EcoRouteProvider');
  }
  return context;
};
