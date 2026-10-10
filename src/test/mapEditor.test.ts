import { describe, expect, it } from 'vitest';
import { SEEDED_TOWN } from '../data/seedTown';
import { projectPointOntoSegment, findNearestRoadEdge, euclideanDistance } from '../utils/geometry';
import { validateTownData } from '../utils/storage';

describe('Map Geometry, Snapping & Persistence', () => {
  it('correctly validates seeded town JSON structure', () => {
    expect(validateTownData(SEEDED_TOWN)).toBe(true);
    expect(validateTownData({})).toBe(false);
    expect(validateTownData({ name: 'Invalid', depot: null })).toBe(false);
  });

  it('projects a point onto a road segment accurately', () => {
    const a = { x: 100, y: 100 };
    const b = { x: 300, y: 100 }; // horizontal line segment
    const p = { x: 200, y: 150 }; // 50 units above midpoint

    const proj = projectPointOntoSegment(p, a, b);
    expect(proj.point.x).toBe(200);
    expect(proj.point.y).toBe(100);
    expect(proj.distance).toBe(50);
    expect(proj.projectionFactor).toBe(0.5);
  });

  it('clamps projection to segment endpoints when point is beyond ends', () => {
    const a = { x: 100, y: 100 };
    const b = { x: 300, y: 100 };
    const pFar = { x: 400, y: 100 }; // beyond point b

    const proj = projectPointOntoSegment(pFar, a, b);
    expect(proj.point.x).toBe(300);
    expect(proj.point.y).toBe(100);
    expect(proj.projectionFactor).toBe(1);
    expect(proj.distance).toBe(100);
  });

  it('snaps a waste bin to the nearest road edge', () => {
    const pointNearDepotLink = { x: 325, y: 382 };
    const snap = findNearestRoadEdge(pointNearDepotLink, SEEDED_TOWN.edges, SEEDED_TOWN.nodes);

    expect(snap.edge).not.toBeNull();
    expect(snap.distance).toBeLessThan(10);
  });

  it('calculates Euclidean distance with zero for coincident points', () => {
    const p1 = { x: 150, y: 250 };
    const p2 = { x: 150, y: 250 };
    expect(euclideanDistance(p1, p2)).toBe(0);

    const p3 = { x: 150, y: 350 };
    expect(euclideanDistance(p1, p3)).toBe(100);
  });
});
