# AlgoViz — React + Vite + TypeScript

An interactive visualizer for sorting, searching, and pathfinding
algorithms, rebuilt as a proper typed React application (final year
project).

## Features

**Sorting** — Bubble, Selection, Insertion, Merge, Quick, and Heap sort,
animated bar-by-bar with live comparison/swap counters.

**Searching** — Linear Search and Binary Search over a random dataset,
with the current search range and eliminated elements highlighted.

**Pathfinding** — Breadth-First Search, Depth-First Search, and
Dijkstra's Algorithm on a paintable grid. Draw walls by clicking and
dragging, and drag the start/end nodes to new positions.

Every mode includes Play / Pause / Step-through controls with an
adjustable speed slider, a live complexity table (best / average /
worst / space), matching pseudocode, and light/dark theming.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # type-check and produce a production build in dist/
npm run preview   # preview the production build locally
```

## Project structure

```
algoviz-react/
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.tsx                 React entry point
    ├── App.tsx                  Mode switching + top-level layout
    ├── styles/global.css        Design tokens, layout, theming
    ├── algorithms/
    │   ├── sorting.ts           Generator-based sort implementations + metadata
    │   ├── searching.ts         Linear/binary search implementations + metadata
    │   └── pathfinding.ts       BFS/DFS/Dijkstra implementations + metadata
    ├── hooks/
    │   ├── useAlgorithmRunner.ts  Drives any step-generator with play/pause/step
    │   └── useTheme.ts            Light/dark theme toggle
    ├── components/               Shared, presentation-only UI pieces
    │   ├── AlgoSelect.tsx
    │   ├── Button.tsx
    │   ├── ComplexityPanel.tsx
    │   ├── Footer.tsx
    │   ├── Legend.tsx
    │   ├── RunControls.tsx
    │   ├── Slider.tsx
    │   ├── StatsPanel.tsx
    │   └── TopBar.tsx
    └── views/                    One self-contained view per mode
        ├── SortingView.tsx
        ├── SearchingView.tsx
        └── PathfindingView.tsx
```

## How it works

Every algorithm is a TypeScript generator function (`sorting.ts`,
`searching.ts`, `pathfinding.ts`) that `yield`s a small, strongly-typed
step object each time it compares, swaps, or visits something, instead
of returning a final result all at once. The `useAlgorithmRunner` hook
pulls one step at a time — either continuously on a timer (Play) or one
click at a time (Step) — and hands it to the view's state, which is all
the UI needs to re-render. This keeps the algorithm code framework-free
and easy to unit test, while React stays fully in control of playback,
pausing, and rendering.

## Possible extensions

- A/B racing mode: run two algorithms on identical data side by side
- Custom array input instead of randomized data
- Weighted-edge grid for A* and comparison against Dijkstra
- Unit tests for the algorithm generators (they're pure functions —
  easy to test in isolation with Vitest)

---

© 2026 Designed and developed by Aditya Kumar Jha
