export type BinType = 'organic' | 'recyclable' | 'general' | 'hazardous';

export interface RoadNode {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface RoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  streetName: string;
  lengthMeters: number;
}

export interface Depot {
  id: string;
  name: string;
  x: number;
  y: number;
  nearestNodeId?: string;
}

export interface WasteBin {
  id: string;
  x: number;
  y: number;
  wasteKg: number;
  type: BinType;
  fillPercent: number; // 0 - 100
  label: string;
  nearestEdgeId?: string;
}

export interface TownZone {
  id: string;
  type: 'park' | 'water' | 'residential' | 'commercial';
  name: string;
  points: { x: number; y: number }[];
  fillColor?: string;
}

export interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'residential' | 'commercial' | 'civic';
  roofColor: string;
  label?: string;
}

export interface TownData {
  version: string;
  name: string;
  scaleMetersPerUnit: number; // e.g. 2.0 or 2.5 meters per SVG unit
  depot: Depot;
  nodes: RoadNode[];
  edges: RoadEdge[];
  bins: WasteBin[];
  zones?: TownZone[];
  buildings?: Building[];
}
