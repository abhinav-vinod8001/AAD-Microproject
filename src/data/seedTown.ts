import type { TownData } from '../types/map';

export const SEEDED_TOWN: TownData = {
  version: '1.0.0',
  name: 'Verdant City Eco-District',
  scaleMetersPerUnit: 2.5, // 100 canvas units = 250 meters
  depot: {
    id: 'DEPOT-01',
    name: 'Verdant City Fleet Depot',
    x: 320,
    y: 380,
    nearestNodeId: 'node-depot',
  },
  nodes: [
    { id: 'n-nw', x: 160, y: 140, label: 'Northwest Gate' },
    { id: 'n-nc', x: 480, y: 140, label: 'North Plaza' },
    { id: 'n-ne1', x: 800, y: 140, label: 'Innovation Way' },
    { id: 'n-ne2', x: 1060, y: 140, label: 'Green Hills Junction' },

    { id: 'n-mw', x: 160, y: 380, label: 'Industrial Gateway' },
    { id: 'node-depot', x: 320, y: 380, label: 'Depot Access Hub' },
    { id: 'n-mc', x: 620, y: 380, label: 'Civic Center Circle' },
    { id: 'n-me1', x: 860, y: 380, label: 'Market Square' },
    { id: 'n-me2', x: 1060, y: 380, label: 'Riverside Cross' },

    { id: 'n-sw', x: 160, y: 640, label: 'Harbor Terminal' },
    { id: 'n-sc', x: 480, y: 640, label: 'Meadow Junction' },
    { id: 'n-se1', x: 800, y: 640, label: 'University Corner' },
    { id: 'n-se2', x: 1060, y: 640, label: 'Botanical Gardens' },

    // Additional cross connectors
    { id: 'n-mid-park', x: 620, y: 220, label: 'Parkway Overlook' },
    { id: 'n-mid-south', x: 620, y: 520, label: 'Cultural Quarter' },
  ],
  edges: [
    // Top Horizontal
    { id: 'e-1', fromNodeId: 'n-nw', toNodeId: 'n-nc', streetName: 'Highland Avenue', lengthMeters: 800 },
    { id: 'e-2', fromNodeId: 'n-nc', toNodeId: 'n-ne1', streetName: 'Highland Avenue East', lengthMeters: 800 },
    { id: 'e-3', fromNodeId: 'n-ne1', toNodeId: 'n-ne2', streetName: 'Ridgeview Way', lengthMeters: 650 },

    // Mid Horizontal
    { id: 'e-4', fromNodeId: 'n-mw', toNodeId: 'node-depot', streetName: 'Eco Boulevard West', lengthMeters: 400 },
    { id: 'e-5', fromNodeId: 'node-depot', toNodeId: 'n-mc', streetName: 'Eco Boulevard Central', lengthMeters: 750 },
    { id: 'e-6', fromNodeId: 'n-mc', toNodeId: 'n-me1', streetName: 'Market Street', lengthMeters: 600 },
    { id: 'e-7', fromNodeId: 'n-me1', toNodeId: 'n-me2', streetName: 'Riverbank Drive', lengthMeters: 500 },

    // Bottom Horizontal
    { id: 'e-8', fromNodeId: 'n-sw', toNodeId: 'n-sc', streetName: 'Harbor Road', lengthMeters: 800 },
    { id: 'e-9', fromNodeId: 'n-sc', toNodeId: 'n-se1', streetName: 'University Avenue', lengthMeters: 800 },
    { id: 'e-10', fromNodeId: 'n-se1', toNodeId: 'n-se2', streetName: 'Garden Boulevard', lengthMeters: 650 },

    // Verticals Left
    { id: 'e-11', fromNodeId: 'n-nw', toNodeId: 'n-mw', streetName: 'West Terminal St', lengthMeters: 600 },
    { id: 'e-12', fromNodeId: 'n-mw', toNodeId: 'n-sw', streetName: 'Industrial Way', lengthMeters: 650 },

    // Verticals Center-Left
    { id: 'e-13', fromNodeId: 'n-nc', toNodeId: 'node-depot', streetName: 'Sanitation Access Link', lengthMeters: 620 },
    { id: 'e-14', fromNodeId: 'node-depot', toNodeId: 'n-sc', streetName: 'Meadow Link Road', lengthMeters: 670 },

    // Verticals Center
    { id: 'e-15', fromNodeId: 'n-nc', toNodeId: 'n-mid-park', streetName: 'Civic Link North', lengthMeters: 380 },
    { id: 'e-16', fromNodeId: 'n-mid-park', toNodeId: 'n-mc', streetName: 'Civic Mall Walk', lengthMeters: 400 },
    { id: 'e-17', fromNodeId: 'n-mc', toNodeId: 'n-mid-south', streetName: 'Symphony Way', lengthMeters: 350 },
    { id: 'e-18', fromNodeId: 'n-mid-south', toNodeId: 'n-sc', streetName: 'Plaza South', lengthMeters: 410 },

    // Verticals East
    { id: 'e-19', fromNodeId: 'n-ne1', toNodeId: 'n-me1', streetName: 'Commerce Street', lengthMeters: 600 },
    { id: 'e-20', fromNodeId: 'n-me1', toNodeId: 'n-se1', streetName: 'Campus Drive', lengthMeters: 650 },
    { id: 'e-21', fromNodeId: 'n-ne2', toNodeId: 'n-me2', streetName: 'Riverside North', lengthMeters: 600 },
    { id: 'e-22', fromNodeId: 'n-me2', toNodeId: 'n-se2', streetName: 'Riverside South', lengthMeters: 650 },
  ],
  bins: [
    {
      id: 'BIN-101',
      label: 'Oak Residences A',
      x: 320,
      y: 140,
      wasteKg: 65,
      type: 'organic',
      fillPercent: 85, // Full (Red - Collected)
      nearestEdgeId: 'e-1',
    },
    {
      id: 'BIN-102',
      label: 'North Metro Plaza',
      x: 480,
      y: 200,
      wasteKg: 85,
      type: 'recyclable',
      fillPercent: 90, // Full (Red - Collected)
      nearestEdgeId: 'e-15',
    },
    {
      id: 'BIN-103',
      label: 'Tech Hub Complex',
      x: 740,
      y: 140,
      wasteKg: 60,
      type: 'general',
      fillPercent: 68, // Medium (Yellow - Collected)
      nearestEdgeId: 'e-2',
    },
    {
      id: 'BIN-104',
      label: 'East Medical Center',
      x: 1060,
      y: 240,
      wasteKg: 35,
      type: 'hazardous',
      fillPercent: 58, // Medium (Yellow - Collected)
      nearestEdgeId: 'e-21',
    },
    {
      id: 'BIN-105',
      label: 'West Freight Hub',
      x: 160,
      y: 280,
      wasteKg: 95,
      type: 'general',
      fillPercent: 95, // Full (Red - Collected)
      nearestEdgeId: 'e-11',
    },
    {
      id: 'BIN-106',
      label: 'Verdant Central Park',
      x: 620,
      y: 300,
      wasteKg: 50,
      type: 'organic',
      fillPercent: 62, // Medium (Yellow - Collected)
      nearestEdgeId: 'e-16',
    },
    {
      id: 'BIN-107',
      label: 'Grand Bazaar Square',
      x: 860,
      y: 290,
      wasteKg: 110,
      type: 'recyclable',
      fillPercent: 98, // Full (Red - Collected)
      nearestEdgeId: 'e-19',
    },
    {
      id: 'BIN-108',
      label: 'River Boardwalk',
      x: 1060,
      y: 490,
      wasteKg: 15,
      type: 'organic',
      fillPercent: 24, // Low (Green - Skipped by Truck)
      nearestEdgeId: 'e-22',
    },
    {
      id: 'BIN-109',
      label: 'Botanical Gate B',
      x: 930,
      y: 640,
      wasteKg: 20,
      type: 'recyclable',
      fillPercent: 30, // Low (Green - Skipped by Truck)
      nearestEdgeId: 'e-10',
    },
    {
      id: 'BIN-110',
      label: 'University Quad',
      x: 800,
      y: 530,
      wasteKg: 80,
      type: 'general',
      fillPercent: 84, // Full (Red - Collected)
      nearestEdgeId: 'e-20',
    },
    {
      id: 'BIN-111',
      label: 'Cultural Pavilion',
      x: 620,
      y: 450,
      wasteKg: 12,
      type: 'organic',
      fillPercent: 18, // Low (Green - Skipped by Truck)
      nearestEdgeId: 'e-17',
    },
    {
      id: 'BIN-112',
      label: 'Harbor Promenade',
      x: 300,
      y: 640,
      wasteKg: 45,
      type: 'recyclable',
      fillPercent: 52, // Medium (Yellow - Collected)
      nearestEdgeId: 'e-8',
    },
  ],
  zones: [
    {
      id: 'z-central-park',
      type: 'park',
      name: 'Verdant City Central Park',
      points: [
        { x: 520, y: 170 },
        { x: 720, y: 170 },
        { x: 720, y: 350 },
        { x: 520, y: 350 },
      ],
      fillColor: '#dcfce7',
    },
    {
      id: 'z-meadow-park',
      type: 'park',
      name: 'Botanical Meadows',
      points: [
        { x: 890, y: 550 },
        { x: 1020, y: 550 },
        { x: 1020, y: 620 },
        { x: 890, y: 620 },
      ],
      fillColor: '#dcfce7',
    },
    {
      id: 'z-river',
      type: 'water',
      name: 'Azure Canal',
      points: [
        { x: 1100, y: 80 },
        { x: 1140, y: 80 },
        { x: 1140, y: 720 },
        { x: 1100, y: 720 },
      ],
      fillColor: '#e0f2fe',
    },
    {
      id: 'z-civic-plaza',
      type: 'commercial',
      name: 'Civic Commons',
      points: [
        { x: 540, y: 400 },
        { x: 700, y: 400 },
        { x: 700, y: 490 },
        { x: 540, y: 490 },
      ],
      fillColor: '#fef3c7',
    },
  ],
  buildings: [
    { id: 'b-1', x: 200, y: 170, width: 80, height: 60, type: 'residential', roofColor: '#f1f5f9', label: 'Maple Row' },
    { id: 'b-2', x: 340, y: 170, width: 100, height: 60, type: 'residential', roofColor: '#f8fafc', label: 'Pine Condos' },
    { id: 'b-3', x: 830, y: 170, width: 110, height: 70, type: 'commercial', roofColor: '#e2e8f0', label: 'Tech Tower' },
    { id: 'b-4', x: 970, y: 170, width: 70, height: 60, type: 'commercial', roofColor: '#f1f5f9', label: 'Biotech Lab' },

    { id: 'b-5', x: 200, y: 420, width: 90, height: 80, type: 'civic', roofColor: '#e2e8f0', label: 'Logistics Bay' },
    { id: 'b-6', x: 720, y: 410, width: 110, height: 70, type: 'commercial', roofColor: '#f1f5f9', label: 'Plaza Retail' },
    { id: 'b-7', x: 900, y: 420, width: 90, height: 75, type: 'commercial', roofColor: '#f8fafc', label: 'Grand Market' },

    { id: 'b-8', x: 200, y: 550, width: 85, height: 70, type: 'residential', roofColor: '#f1f5f9', label: 'Harbor Apts' },
    { id: 'b-9', x: 330, y: 550, width: 110, height: 65, type: 'residential', roofColor: '#f8fafc', label: 'Sunnyside Villas' },
    { id: 'b-10', x: 700, y: 550, width: 80, height: 70, type: 'civic', roofColor: '#e2e8f0', label: 'Science Hall' },
    { id: 'b-11', x: 830, y: 550, width: 90, height: 70, type: 'civic', roofColor: '#f1f5f9', label: 'Library & Arts' },
  ],
};
