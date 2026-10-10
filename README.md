# EcoRoute — Virtual Waste Collection Route Optimization Simulator

**EcoRoute** is an interactive, browser-based smart-city waste collection simulator engineered for **Algorithm Analysis and Design (AAD)**. It models urban refuse collection as the classic **Traveling Salesperson Problem (TSP)**, comparing greedy heuristic approximations against an exact Branch-and-Bound solver equipped with 1-Tree / MST lower-bound relaxation and subtree pruning.

EcoRoute features a **100% custom SVG virtual town** with an interactive road network, editable waste bins, an animated garbage truck simulation engine, customizable vehicle emissions parameters, and Recharts benchmarking analytics.

---

## 🚀 Key Features

### 1. Interactive 2D Virtual Map Editor (SVG-Based)
* **Custom SVG Rendering**: Zero external map tiles (no Google Maps or OpenStreetMap). Rendered with an SVG coordinate system (1 unit = 2.5 meters).
* **Three Workspace Modes**:
  * **View Route**: Inspect calculated tours, numbered stop badges, directional road links, and animated truck simulation.
  * **Manage Bins**: Plant new waste bins, drag them along streets, edit capacity, waste weight (kg), fill level (%), and waste category (Organic, Recyclable, General, Hazardous).
  * **Edit Map**: Add intersection nodes, drag intersections, connect nodes into two-way roads with street names, and adjust lengths in meters.
* **Smart Road Snapping**: Automatically projects and snaps placed/dragged bins to the nearest road segment.
* **Seeded Demo Town**: Pre-populated with 12 realistic collection points, 15 intersection nodes, 22 road corridors, zoned parks, and a central depot.
* **State Persistence & Export**: Auto-saves to browser `localStorage`; exports and imports full town topologies as JSON.
* **Algorithm Trace Console**: A separate terminal-style presentation panel logs Dijkstra path preparation, TSP decisions, route legs, payload, and live simulation status.

### 2. TSP Optimization Algorithms (Academic Core)
EcoRoute implements its own TSP solvers in client-side TypeScript without third-party optimization libraries:

| Dimension | Nearest Neighbor (Greedy) | Branch & Bound (Exact) | Sequential Baseline |
| :--- | :--- | :--- | :--- |
| **Strategy** | Greedy heuristic: selects closest unvisited stop at each step | Depth-First Branch & Bound with MST Lower Bound relaxation | Arbitrary creation order ($0 \to 1 \to 2 \dots \to N \to 0$) |
| **Time Complexity** | $\mathcal{O}(n^2)$ | Exponential worst-case $\mathcal{O}(n!)$, heavily pruned | $\mathcal{O}(n)$ |
| **Space Complexity** | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ stack depth | $\mathcal{O}(n)$ |
| **Optimality** | Approximate (No guarantee) | **Strict Global Minimum Guaranteed** | Unoptimized |
| **Typical Runtime** | $< 0.1 \text{ ms}$ | $< 5 \text{ ms}$ for $n \le 14$ stops | $< 0.05 \text{ ms}$ |
| **Pruning Mechanism** | None | Admissible 1-Tree MST lower bound + greedy upper bound | None |

#### Branch & Bound Lower Bound Formulation:
Given partial path $P = [0, v_1, \dots, v_k]$ and unvisited vertices $U$:
$$\text{LowerBound}(P, U) = \text{cost}(P) + \min_{u \in U} D[v_k][u] + \text{MST}(U) + \min_{u \in U} D[u][0]$$
* $\min_{u \in U} D[v_k][u]$: Minimum travel cost from the current end of path into the unvisited set $U$.
* $\text{MST}(U)$: Minimum Spanning Tree connecting all unvisited vertices (calculated via Prim's algorithm in $\mathcal{O}(|U|^2)$).
* $\min_{u \in U} D[u][0]$: Minimum return cost from set $U$ back to the Depot.
* **Pruning Condition**: If $\text{LowerBound}(P, U) \ge \text{bestCost}$, the entire subtree is immediately pruned.
* **Safety Guard**: Includes a configurable search budget (250,000 nodes or 5 seconds) to ensure the browser never freezes.

### 3. Animated Garbage Truck Simulation
* **Physics & Heading**: Smooth 60 FPS animation using `requestAnimationFrame`, calculating real-time vehicle rotation $\theta = \text{atan2}(\Delta y, \Delta x)$.
* **Collection Stops**: Pauses briefly at each bin while collection effects animate, bin checkmarks activate, and cargo weight accumulates dynamically.
* **Controls**: Play, Pause, Resume, Reset, and speed presets (0.5x, 1x, 2x, 4x).
* **Return to Depot**: Vehicle returns to depot at completion, triggering a victory sequence with celebratory confetti.

### 4. Sustainability & Emission Analytics
* **Custom Vehicle Parameters**:
  * Default Fuel Efficiency: $28.5 \text{ L / 100 km}$ (editable medium refuse vehicle).
  * Emission Factor: $2.68 \text{ kg } CO_2 \text{ / L diesel}$ (editable).
* **Comparative Savings**:
  * Distance Saved: $\Delta d = d_{\text{baseline}} - d_{\text{optimized}}$
  * Efficiency Improvement: $\frac{\Delta d}{d_{\text{baseline}}} \times 100\%$
  * Avoided Fuel & Emissions: Estimates fuel saved (L) and $CO_2$ avoided (kg).
* **Visual Benchmarks**: Built-in Recharts bar charts comparing distance, computation time, and search metrics.

---

## 🛠️ Tech Stack

* **Framework**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4 + Lucide Icons
* **Charting**: Recharts
* **Animation**: SVG DOM + `requestAnimationFrame` + Canvas Confetti
* **Testing**: Vitest unit testing framework

---

## 📂 Project Architecture

```
src/
├── types/
│   ├── map.ts              # RoadNode, RoadEdge, Depot, WasteBin, TownData
│   ├── tsp.ts              # TSPStop, DistanceMatrixData, TSPResult, SustainabilityMetrics
│   └── simulation.ts       # SimulationState, VehicleSettings
├── algorithms/
│   ├── distanceMatrix.ts   # Stop indexing and road-network distance matrix generation
│   ├── nearestNeighbor.ts  # O(n^2) greedy TSP solver
│   ├── branchAndBound.ts   # Exact TSP solver with 1-Tree MST lower bound & pruning
│   └── baselineTour.ts     # Sequential baseline tour & carbon metrics calculator
├── data/
│   └── seedTown.ts         # Pre-configured Verdant City with 12 bins, 15 nodes, 22 roads
├── context/
│   └── EcoRouteContext.tsx # Central application state, solver execution & animation loop
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Global branding, KPIs, export/import & settings
│   │   ├── Sidebar.tsx          # Mode switcher, algorithm selection & simulation controls
│   │   └── AnalyticsDrawer.tsx  # Bottom expandable panel with impact, itinerary & charts
│   ├── map/
│   │   ├── MapCanvas.tsx        # Viewport with pan, zoom, grid, zones, and building layers
│   │   ├── RoadLayer.tsx        # 2-lane asphalt roads, sidewalks, lane dashes & edit handles
│   │   ├── BinMarker.tsx        # Waste bin pins with fill gauge & collection state
│   │   ├── DepotMarker.tsx      # Central sanitation facility marker
│   │   ├── RouteOverlay.tsx     # Directional route paths with glow & active leg highlight
│   │   ├── AnimatedTruck.tsx    # 2.5D garbage truck with cab, wheels, and cargo level
│   │   ├── MapControls.tsx      # Floating zoom, fit, reset, grid, and snapping buttons
│   │   └── EditModeBar.tsx      # Floating mode instructions & recalculate trigger
│   ├── modals/
│   │   ├── BinEditModal.tsx     # Edit bin label, category, quantity, fill level, and delete
│   │   ├── RoadEditModal.tsx    # Edit road name, length in meters, and delete
│   │   ├── MatrixModal.tsx      # Read-only road-network distance matrix viewer
│   │   ├── AlgorithmTraceModal.tsx # Separate algorithm execution console
│   │   └── SettingsModal.tsx    # Vehicle fuel efficiency & emission factor settings
│   └── analytics/
│       ├── SustainabilityCard.tsx # Carbon savings & fuel avoided cards
│       ├── ComparisonChart.tsx    # Recharts comparison of distance & execution time
│       └── RouteStepTable.tsx     # Step-by-step collection itinerary table
├── utils/
│   ├── geometry.ts         # Point projection, Euclidean metric, angles, road snapping
│   └── storage.ts          # LocalStorage persistence, export/import JSON validation
└── test/
    ├── tsp.test.ts         # Vitest tests for TSP algorithms, depot return & bounds
    └── mapEditor.test.ts   # Vitest tests for road snapping, geometry & validation
```

---

## 🏃 Getting Started Locally

### Prerequisites
* Node.js 18+ (tested on Node v25)
* npm 9+

### 1. Installation
```bash
git clone <repository-url>
cd "AAD Microproject"
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Running Unit Tests
```bash
npm test
```
Runs the 11 unit tests covering TSP optimality, greedy heuristics, depot return, distance matrices, and road snapping.

### 4. Production Build
```bash
npm run build
```
Generates production-optimized static assets in the `dist/` directory.

---

## ☁️ Deployment to Vercel

EcoRoute is a fully client-side app. It needs **no backend, database, API key, or environment variables** for the included demonstration data. User edits are saved only in that visitor's browser through `localStorage`.

EcoRoute is 100% client-side and ready for instant deployment to Vercel:

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the Vercel Dashboard, click **New Project** and select the repository.
3. Configure the build settings (normally detected automatically by Vercel):
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. The included `vercel.json` ensures client-side routing rewrites work properly.
5. Click **Deploy**.

---

## 📄 License
Created for the **Algorithm Analysis and Design (AAD)** Project. Distributed under the MIT License.
