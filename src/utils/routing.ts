import type { RoadNode, RoadEdge } from '../types/map';
import type { Point } from './geometry';
import { euclideanDistance, projectPointOntoSegment } from './geometry';

export interface RouteEndpoint extends Point {
  id?: string;
  nearestNodeId?: string;
  nearestEdgeId?: string;
}

interface Attachment extends Point { id: string; edgeId?: string; t?: number }
interface GraphVertex extends Point { id: string }

function attachToRoadNetwork(point: RouteEndpoint, nodes: RoadNode[], edges: RoadEdge[], fallbackId: string): Attachment | null {
  if (point.nearestNodeId) {
    const node = nodes.find((candidate) => candidate.id === point.nearestNodeId);
    if (node) return { id: `node:${node.id}`, x: node.x, y: node.y };
  }
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const preferred = point.nearestEdgeId ? edges.find((edge) => edge.id === point.nearestEdgeId) : undefined;
  const candidates = preferred ? [preferred] : edges;
  let best: { edge: RoadEdge; x: number; y: number; t: number; distance: number } | null = null;
  for (const edge of candidates) {
    const from = nodeMap.get(edge.fromNodeId);
    const to = nodeMap.get(edge.toNodeId);
    if (!from || !to) continue;
    const projection = projectPointOntoSegment(point, from, to);
    if (!best || projection.distance < best.distance) {
      best = { edge, x: projection.point.x, y: projection.point.y, t: projection.projectionFactor, distance: projection.distance };
    }
  }
  return best ? { id: `stop:${point.id ?? fallbackId}`, edgeId: best.edge.id, x: best.x, y: best.y, t: best.t } : null;
}

function buildRoadGraph(nodes: RoadNode[], edges: RoadEdge[], endpoints: RouteEndpoint[]) {
  const vertices = new Map<string, GraphVertex>();
  const adjacency = new Map<string, { to: string; weight: number }[]>();
  const edgeAttachments = new Map<string, Attachment[]>();
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const addVertex = (vertex: GraphVertex) => {
    vertices.set(vertex.id, vertex);
    if (!adjacency.has(vertex.id)) adjacency.set(vertex.id, []);
  };
  const addLink = (from: string, to: string, weight: number) => {
    adjacency.get(from)?.push({ to, weight });
    adjacency.get(to)?.push({ to: from, weight });
  };
  for (const node of nodes) addVertex({ id: `node:${node.id}`, x: node.x, y: node.y });

  const attachments = endpoints.map((endpoint, index) => attachToRoadNetwork(endpoint, nodes, edges, String(index)));
  attachments.forEach((attachment) => {
    if (!attachment) return;
    addVertex(attachment);
    if (attachment.edgeId) edgeAttachments.set(attachment.edgeId, [...(edgeAttachments.get(attachment.edgeId) ?? []), attachment]);
  });

  for (const edge of edges) {
    const from = nodeMap.get(edge.fromNodeId);
    const to = nodeMap.get(edge.toNodeId);
    if (!from || !to) continue;
    const points: Attachment[] = [
      { id: `node:${from.id}`, x: from.x, y: from.y, t: 0 },
      ...(edgeAttachments.get(edge.id) ?? []),
      { id: `node:${to.id}`, x: to.x, y: to.y, t: 1 },
    ].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
    for (let index = 0; index < points.length - 1; index++) {
      const left = points[index];
      const right = points[index + 1];
      addLink(left.id, right.id, Math.max(0, (right.t! - left.t!) * edge.lengthMeters));
    }
  }
  return { vertices, adjacency, attachments };
}

/**
 * Dijkstra on an augmented road graph. Stops split their containing road, so
 * the returned polyline is made entirely of road coordinates. Edge lengths,
 * rather than canvas pixels, are the authoritative distances.
 */
export function getShortestPath(nodes: RoadNode[], edges: RoadEdge[], start: RouteEndpoint, end: RouteEndpoint, scaleMetersPerUnit = 1): { distancePixels: number; distanceMeters: number; path: Point[] } {
  if (!nodes.length || !edges.length) {
    const direct = euclideanDistance(start, end);
    return { distancePixels: direct, distanceMeters: direct * scaleMetersPerUnit, path: [start, end] };
  }
  const { vertices, adjacency, attachments } = buildRoadGraph(nodes, edges, [start, end]);
  const startAttachment = attachments[0];
  const endAttachment = attachments[1];
  if (!startAttachment || !endAttachment) {
    const direct = euclideanDistance(start, end);
    return { distancePixels: direct, distanceMeters: direct * scaleMetersPerUnit, path: [start, end] };
  }
  if (startAttachment.id === endAttachment.id) return { distancePixels: 0, distanceMeters: 0, path: [{ x: startAttachment.x, y: startAttachment.y }] };

  const distances = new Map<string, number>([...vertices.keys()].map((id) => [id, Infinity]));
  const previous = new Map<string, string>();
  const remaining = new Set(vertices.keys());
  distances.set(startAttachment.id, 0);
  while (remaining.size) {
    let current: string | undefined;
    let currentDistance = Infinity;
    for (const id of remaining) {
      const distance = distances.get(id)!;
      if (distance < currentDistance) { current = id; currentDistance = distance; }
    }
    if (!current || currentDistance === Infinity) break;
    remaining.delete(current);
    if (current === endAttachment.id) break;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!remaining.has(neighbor.to)) continue;
      const candidate = currentDistance + neighbor.weight;
      if (candidate < distances.get(neighbor.to)!) { distances.set(neighbor.to, candidate); previous.set(neighbor.to, current); }
    }
  }
  const distanceMeters = distances.get(endAttachment.id)!;
  if (!Number.isFinite(distanceMeters)) {
    const direct = euclideanDistance(start, end);
    return { distancePixels: direct, distanceMeters: direct * scaleMetersPerUnit, path: [start, end] };
  }
  const ids: string[] = [];
  for (let current: string | undefined = endAttachment.id; current; current = previous.get(current)) ids.unshift(current);
  const path = ids.map((id) => vertices.get(id)!).map(({ x, y }) => ({ x, y }));
  const distancePixels = path.slice(1).reduce((total, point, index) => total + euclideanDistance(path[index], point), 0);
  return { distancePixels, distanceMeters, path };
}
