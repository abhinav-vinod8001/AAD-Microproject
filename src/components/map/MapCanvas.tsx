import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEcoRoute } from '../../context/EcoRouteContext';
import { RoadLayer } from './RoadLayer';
import { BinMarker } from './BinMarker';
import { DepotMarker } from './DepotMarker';
import { RouteOverlay } from './RouteOverlay';
import { AnimatedTruck } from './AnimatedTruck';
import { MapControls } from './MapControls';
import { EditModeBar } from './EditModeBar';
import type { RoadNode, WasteBin } from '../../types/map';
import { findNearestRoadEdge } from '../../utils/geometry';

export const MapCanvas: React.FC = () => {
  const {
    mode,
    town,
    settings,
    selectedNode,
    setSelectedNode,
    selectedEdge,
    setSelectedEdge,
    selectedBin,
    setSelectedBin,
    connectingFromNode,
    setConnectingFromNode,
    addNode,
    updateNode,
    addEdge,
    addBin,
    updateBin,
    updateDepotPosition,
    activeResult,
    simulation,
    distanceMatrixData,
  } = useEcoRoute();

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging items (nodes, bins, depot)
  const [draggingItem, setDraggingItem] = useState<{
    type: 'node' | 'bin' | 'depot';
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Options
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToRoads, setSnapToRoads] = useState<boolean>(true);
  const [mouseSvgPos, setMouseSvgPos] = useState<{ x: number; y: number } | null>(null);

  // Convert client mouse coordinates to virtual SVG coordinates (1200x800)
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      // Account for pan and zoom
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;

      const normX = (screenX - pan.x) / zoom;
      const normY = (screenY - pan.y) / zoom;

      // Scale to internal 1200x800 viewBox
      const scaleFactor = 1200 / rect.width;
      return {
        x: normX * scaleFactor,
        y: normY * scaleFactor,
      };
    },
    [pan, zoom]
  );

  // Map view controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Number((z * 1.2).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z / 1.2).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitView = () => {
    setZoom(0.95);
    setPan({ x: 10, y: 10 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(2.5, Math.max(0.5, prevZoom * zoomDelta));
      return Number(nextZoom.toFixed(2));
    });
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle click or space or click in view-route mode pans canvas
    if (e.button === 1 || e.shiftKey || mode === 'view-route') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const pos = getSvgCoordinates(e.clientX, e.clientY);

    // If in Edit Map mode and not clicking an existing item, add a new intersection
    if (mode === 'edit-map' && e.target === svgRef.current) {
      if (connectingFromNode) {
        setConnectingFromNode(null);
      } else {
        const newNode = addNode(pos.x, pos.y);
        setSelectedNode(newNode);
      }
      return;
    }

    // If in Manage Bins mode and clicking canvas, plant a new bin
    if (mode === 'manage-bins' && e.target === svgRef.current) {
      let binX = pos.x;
      let binY = pos.y;

      if (snapToRoads) {
        const snap = findNearestRoadEdge(pos, town.edges, town.nodes);
        if (snap.edge && snap.distance < 120) {
          binX = snap.snappedPoint.x;
          binY = snap.snappedPoint.y;
        }
      }

      const newBin = addBin({
        x: binX,
        y: binY,
        wasteKg: 45,
        type: 'organic',
        fillPercent: 70,
      });
      setSelectedBin(newBin);
    }
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getSvgCoordinates(e.clientX, e.clientY);
    setMouseSvgPos(pos);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingItem) {
      let targetX = pos.x - draggingItem.offsetX;
      let targetY = pos.y - draggingItem.offsetY;

      // Keep within bounds
      targetX = Math.max(50, Math.min(1150, targetX));
      targetY = Math.max(50, Math.min(750, targetY));

      if (draggingItem.type === 'node') {
        updateNode(draggingItem.id, targetX, targetY);
      } else if (draggingItem.type === 'bin') {
        if (snapToRoads) {
          const snap = findNearestRoadEdge({ x: targetX, y: targetY }, town.edges, town.nodes);
          if (snap.edge && snap.distance < 80) {
            targetX = snap.snappedPoint.x;
            targetY = snap.snappedPoint.y;
          }
        }
        updateBin(draggingItem.id, { x: targetX, y: targetY });
      } else if (draggingItem.type === 'depot') {
        updateDepotPosition(targetX, targetY);
      }
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingItem(null);
  };

  // End drag if mouse leaves window
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingItem(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Road node interaction
  const handleNodeClick = (node: RoadNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'edit-map') {
      if (!connectingFromNode) {
        // Start connection
        setConnectingFromNode(node);
        setSelectedNode(node);
      } else if (connectingFromNode.id !== node.id) {
        // Connect the two nodes with a road!
        addEdge(connectingFromNode.id, node.id);
        setConnectingFromNode(null);
        setSelectedNode(node);
      } else {
        // Clicked same node: cancel connection
        setConnectingFromNode(null);
      }
    }
  };

  const handleNodeMouseDown = (node: RoadNode, e: React.MouseEvent) => {
    if (mode === 'edit-map' && e.button === 0 && !connectingFromNode) {
      e.stopPropagation();
      const pos = getSvgCoordinates(e.clientX, e.clientY);
      setDraggingItem({
        type: 'node',
        id: node.id,
        offsetX: pos.x - node.x,
        offsetY: pos.y - node.y,
      });
      setSelectedNode(node);
    }
  };

  // Bin interaction
  const handleBinMouseDown = (bin: WasteBin, e: React.MouseEvent) => {
    if (mode === 'manage-bins' && e.button === 0) {
      e.stopPropagation();
      const pos = getSvgCoordinates(e.clientX, e.clientY);
      setDraggingItem({
        type: 'bin',
        id: bin.id,
        offsetX: pos.x - bin.x,
        offsetY: pos.y - bin.y,
      });
      setSelectedBin(bin);
    }
  };

  const handleBinClick = (bin: WasteBin, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBin(bin);
  };

  // Depot interaction
  const handleDepotMouseDown = (e: React.MouseEvent) => {
    if (mode === 'edit-map' && e.button === 0) {
      e.stopPropagation();
      const pos = getSvgCoordinates(e.clientX, e.clientY);
      setDraggingItem({
        type: 'depot',
        id: town.depot.id,
        offsetX: pos.x - town.depot.x,
        offsetY: pos.y - town.depot.y,
      });
    }
  };

  // Map stop numbers for bins if active route exists
  const stopIndexMap = new Map<string, number>();
  if (activeResult) {
    activeResult.stopSequence.forEach((stop, idx) => {
      if (!stop.isDepot && stop.bin) {
        stopIndexMap.set(stop.bin.id, idx);
      }
    });
  }

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-100 flex items-center justify-center select-none">
      {/* Floating Toolbar & Guidance */}
      <EditModeBar mode={mode} />
      <MapControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onResetView={handleResetView}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((g) => !g)}
        snapToRoads={snapToRoads}
        onToggleSnap={() => setSnapToRoads((s) => !s)}
      />

      {/* Main SVG Map Canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 1200 800"
        className={`w-full h-full transition-transform duration-75 ${
          isPanning ? 'cursor-grabbing' : mode === 'edit-map' ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>

          {/* Headlight beam gradient */}
          <linearGradient id="headlight-beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
          </linearGradient>

          {/* Park grass pattern */}
          <pattern id="park-grass" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#dcfce7" />
            <circle cx="5" cy="5" r="1.5" fill="#86efac" opacity="0.6" />
            <circle cx="15" cy="15" r="1.5" fill="#86efac" opacity="0.6" />
          </pattern>

          {/* Water wave pattern */}
          <pattern id="water-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#e0f2fe" />
            <path d="M 0 15 Q 7.5 10 15 15 T 30 15" fill="none" stroke="#bae6fd" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* 1. Base Ground */}
        <rect width="1200" height="800" fill="#f8fafc" />

        {/* 2. Optional Grid */}
        {showGrid && <rect width="1200" height="800" fill="url(#city-grid)" opacity="0.8" />}

        {/* 3. Town Districts / Environmental Zones */}
        {town.zones?.map((zone) => {
          const pointsStr = zone.points.map((p) => `${p.x},${p.y}`).join(' ');
          const fill = zone.type === 'park' ? 'url(#park-grass)' : zone.type === 'water' ? 'url(#water-pattern)' : zone.fillColor || '#fef3c7';

          return (
            <g key={`zone-${zone.id}`}>
              <polygon points={pointsStr} fill={fill} stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Zone label */}
              {zone.points.length > 0 && (
                <text
                  x={zone.points[0].x + 20}
                  y={zone.points[0].y + 24}
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="system-ui"
                  className="select-none pointer-events-none"
                >
                  {zone.name.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {/* 4. Town Buildings (2.5D architectural footprint) */}
        {town.buildings?.map((b) => (
          <g key={`bldg-${b.id}`} transform={`translate(${b.x}, ${b.y})`} className="pointer-events-none select-none">
            {/* Building Shadow */}
            <rect x="4" y="4" width={b.width} height={b.height} rx="4" fill="#000000" opacity="0.08" />
            {/* Building Body */}
            <rect
              x="0"
              y="0"
              width={b.width}
              height={b.height}
              rx="4"
              fill={b.roofColor}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Roof Architectural Rim */}
            <rect
              x="3"
              y="3"
              width={b.width - 6}
              height={b.height - 6}
              rx="2"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            {/* Building Name Tag */}
            {b.label && (
              <text
                x={b.width / 2}
                y={b.height / 2 + 3}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui"
              >
                {b.label}
              </text>
            )}
          </g>
        ))}

        {/* 5. Road Network Layer */}
        <RoadLayer
          nodes={town.nodes}
          edges={town.edges}
          isEditMode={mode === 'edit-map'}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          connectingFromNode={connectingFromNode}
          mousePos={mouseSvgPos}
          onNodeClick={handleNodeClick}
          onNodeMouseDown={handleNodeMouseDown}
          onEdgeClick={(edge) => {
            if (mode === 'edit-map') setSelectedEdge(edge);
          }}
        />

        {/* 6. Route Path Overlay (in View Route mode or during simulation) */}
        {mode === 'view-route' && activeResult && (
          <RouteOverlay
            stops={activeResult.stopSequence}
            activeLegIndex={simulation.currentLegIndex}
            isSimulating={simulation.status === 'playing' || simulation.status === 'paused'}
            distanceMatrixData={distanceMatrixData}
          />
        )}

        {/* 7. Waste Bins */}
        {town.bins.map((bin) => {
          const isCollected = simulation.collectedBinIds.includes(bin.id);
          const isCurrentTarget = Boolean(
            simulation.status === 'playing' &&
            activeResult &&
            activeResult.stopSequence[simulation.currentLegIndex + 1]?.bin?.id === bin.id
          );
          const isBeingCollected = Boolean(
            simulation.isPausingAtBin &&
            activeResult &&
            activeResult.stopSequence[simulation.currentLegIndex]?.bin?.id === bin.id
          );

          return (
            <BinMarker
              key={`bin-${bin.id}`}
              bin={bin}
              stopIndex={stopIndexMap.get(bin.id)}
              isCollected={isCollected}
              isCurrentTarget={isCurrentTarget}
              isBeingCollected={isBeingCollected}
              isSelected={selectedBin?.id === bin.id}
              isManageMode={mode === 'manage-bins'}
              onClick={(e) => handleBinClick(bin, e)}
              onMouseDown={(e) => handleBinMouseDown(bin, e)}
            />
          );
        })}

        {/* 8. Depot Facility Marker */}
        <DepotMarker
          depot={town.depot}
          isEditMode={mode === 'edit-map'}
          onMouseDown={handleDepotMouseDown}
          onClick={() => {
            if (mode === 'edit-map') {
              // Click depot to inspect or reset
            }
          }}
        />

        {/* 9. Animated Garbage Truck Simulation */}
        {mode === 'view-route' && activeResult && (
          <AnimatedTruck
            x={simulation.truckPosition.x}
            y={simulation.truckPosition.y}
            angle={simulation.truckAngle}
            isMoving={simulation.status === 'playing' && !simulation.isPausingAtBin}
            isPausingAtBin={simulation.isPausingAtBin}
            wasteLoadedKg={simulation.currentWasteLoadedKg}
            capacityKg={settings.truckCapacityKg}
          />
        )}
      </svg>
    </div>
  );
};
