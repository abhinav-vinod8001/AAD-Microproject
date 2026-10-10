import React from 'react';
import type { RoadEdge, RoadNode } from '../../types/map';

interface RoadLayerProps {
  nodes: RoadNode[];
  edges: RoadEdge[];
  isEditMode: boolean;
  selectedNode: RoadNode | null;
  selectedEdge: RoadEdge | null;
  connectingFromNode: RoadNode | null;
  mousePos: { x: number; y: number } | null;
  onNodeClick: (node: RoadNode, e: React.MouseEvent) => void;
  onNodeMouseDown: (node: RoadNode, e: React.MouseEvent) => void;
  onEdgeClick: (edge: RoadEdge, e: React.MouseEvent) => void;
}

export const RoadLayer: React.FC<RoadLayerProps> = ({
  nodes,
  edges,
  isEditMode,
  selectedNode,
  selectedEdge,
  connectingFromNode,
  mousePos,
  onNodeClick,
  onNodeMouseDown,
  onEdgeClick,
}) => {
  const nodeMap = new Map<string, RoadNode>(nodes.map((n) => [n.id, n]));

  return (
    <g className="road-network">
      {/* 1. Road Sidewalk / Outer Curb Layer */}
      {edges.map((edge) => {
        const from = nodeMap.get(edge.fromNodeId);
        const to = nodeMap.get(edge.toNodeId);
        if (!from || !to) return null;
        return (
          <line
            key={`curb-${edge.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#cbd5e1"
            strokeWidth="32"
            strokeLinecap="round"
          />
        );
      })}

      {/* 2. Main Asphalt Road Bed */}
      {edges.map((edge) => {
        const from = nodeMap.get(edge.fromNodeId);
        const to = nodeMap.get(edge.toNodeId);
        if (!from || !to) return null;
        const isSelected = selectedEdge?.id === edge.id;

        return (
          <g key={`bed-${edge.id}`}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isSelected ? '#3b82f6' : '#334155'}
              strokeWidth={isSelected ? '26' : '24'}
              strokeLinecap="round"
              className={isEditMode ? 'cursor-pointer hover:stroke-slate-600 transition-colors' : ''}
              onClick={(e) => onEdgeClick(edge, e)}
            />
            {/* Center Dashed Lane Divider */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#f8fafc"
              strokeWidth="2"
              strokeDasharray="8 8"
              opacity="0.65"
              className="pointer-events-none"
            />
          </g>
        );
      })}

      {/* 3. Road Segment Street Name Labels */}
      {edges.map((edge) => {
        const from = nodeMap.get(edge.fromNodeId);
        const to = nodeMap.get(edge.toNodeId);
        if (!from || !to) return null;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        let angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
        // Keep text right-side up
        if (angle > 90 || angle < -90) {
          angle += 180;
        }

        return (
          <g
            key={`label-${edge.id}`}
            transform={`translate(${midX}, ${midY}) rotate(${angle})`}
            className="pointer-events-none select-none"
          >
            <text
              y="-15"
              textAnchor="middle"
              fill="#475569"
              fontSize="9"
              fontWeight="600"
              fontFamily="system-ui"
              opacity="0.85"
            >
              {edge.streetName} ({edge.lengthMeters}m)
            </text>
          </g>
        );
      })}

      {/* 4. Intersection Node Junctions */}
      {nodes.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isConnecting = connectingFromNode?.id === node.id;

        return (
          <g
            key={`node-${node.id}`}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={(e) => onNodeClick(node, e)}
            onMouseDown={(e) => onNodeMouseDown(node, e)}
            className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}
          >
            {/* Outer curb */}
            <circle r="18" fill="#cbd5e1" />
            {/* Asphalt junction core */}
            <circle
              r="14"
              fill={isSelected || isConnecting ? '#2563eb' : '#334155'}
              stroke="#ffffff"
              strokeWidth={isEditMode ? 2.5 : 1}
              className="transition-colors"
            />
            {/* Connection mode pulse */}
            {isConnecting && (
              <circle r="22" fill="none" stroke="#3b82f6" strokeWidth="2" className="animate-ping" />
            )}

            {/* In Edit mode: Intersection node handle */}
            {isEditMode && (
              <circle r="5" fill="#ffffff" opacity="0.9" />
            )}
          </g>
        );
      })}

      {/* 5. In Progress Road Connection Line */}
      {isEditMode && connectingFromNode && mousePos && (
        <line
          x1={connectingFromNode.x}
          y1={connectingFromNode.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="#2563eb"
          strokeWidth="4"
          strokeDasharray="6 4"
          className="pointer-events-none animate-pulse"
        />
      )}
    </g>
  );
};
