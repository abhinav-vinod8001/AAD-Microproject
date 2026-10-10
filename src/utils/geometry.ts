import type { RoadEdge, RoadNode } from '../types/map';

export interface Point {
  x: number;
  y: number;
}

export function euclideanDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

export function interpolatePoint(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

export function calculateHeadingAngle(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return 0;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Projects a point onto a line segment [a, b].
 * Returns the closest projected point on the segment and the distance.
 */
export function projectPointOntoSegment(
  p: Point,
  a: Point,
  b: Point
): { point: Point; distance: number; projectionFactor: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abLenSq = abx * abx + aby * aby;

  if (abLenSq === 0) {
    const d = euclideanDistance(p, a);
    return { point: { ...a }, distance: d, projectionFactor: 0 };
  }

  // Projection factor t along line ab
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));

  const projPoint = {
    x: a.x + t * abx,
    y: a.y + t * aby,
  };

  return {
    point: projPoint,
    distance: euclideanDistance(p, projPoint),
    projectionFactor: t,
  };
}

/**
 * Finds the nearest road segment to a given point and snaps to it.
 */
export function findNearestRoadEdge(
  point: Point,
  edges: RoadEdge[],
  nodes: RoadNode[]
): { edge: RoadEdge | null; snappedPoint: Point; distance: number } {
  const nodeMap = new Map<string, RoadNode>(nodes.map((n) => [n.id, n]));
  let bestEdge: RoadEdge | null = null;
  let bestDist = Infinity;
  let bestSnapped: Point = { ...point };

  for (const edge of edges) {
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);
    if (!fromNode || !toNode) continue;

    const result = projectPointOntoSegment(point, fromNode, toNode);
    if (result.distance < bestDist) {
      bestDist = result.distance;
      bestEdge = edge;
      bestSnapped = result.point;
    }
  }

  return { edge: bestEdge, snappedPoint: bestSnapped, distance: bestDist };
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${Math.round(kg)} kg`;
}
