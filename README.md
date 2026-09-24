# AlgoViz Studio — Architecture & Technical Specification

AlgoViz Studio is an interactive computational visualization platform and computer science workbench designed to render abstract algorithms into tangible, observable, and acoustically audible state machines. The platform combines deterministic step generation, microtonal audio synthesis, and asymptotic complexity analysis within a tactile claymorphic design system.

---

## 1. What It Is

AlgoViz Studio is an educational and analytical instrument built to demonstrate the operational mechanics of fundamental computer science algorithms. Rather than presenting static diagrams or pre-rendered animations, the application evaluates algorithms dynamically in the browser runtime.

Every sorting pass, array partition, binary boundary adjustment, and graph traversal step is calculated on-the-fly and rendered with real-time computational telemetry (comparisons, swaps, node expansions, and queue sizes) alongside matching Big-O bounds and synchronized pseudocode.

---

## 2. What It Does

AlgoViz Studio provides three dedicated computational visualization environments, an integrated acoustic synthesizer, an asymptotic complexity analyzer, and a dual-theme tactile interface:

### 2.1 Sorting Visualizer
- **Algorithms Implemented**:
  - Bubble Sort (Iterative adjacent comparison and bubble-up)
  - Selection Sort (Minimum element extraction and in-place exchange)
  - Insertion Sort (Adaptive element shifting into sorted prefix)
  - Merge Sort (Recursive divide-and-conquer with out-of-place buffer recombination)
  - Quick Sort (Lomuto partitioning scheme with pivot isolation)
  - Heap Sort (Max-heap binary tree formulation and sequential root extraction)
- **Dataset Distributions**:
  - Uniform Random (Stochastic distribution across dynamic bounds)
  - Nearly Sorted (Pre-ordered sequence with localized stochastic inversions)
  - Reversed (Strict descending order representing worst-case inputs)
  - Few Unique (Quantized values producing high duplicate frequency)
  - Pyramid (Gaussian-style ascending-descending mountain configuration)
- **Telemetry & Controls**:
  - Real-time comparison and swap counters
  - Real-time variable bar sizing (8 to 100 elements)
  - Execution speed throttle (0.25x to 5.0x)
  - Step-by-step single-cycle stepping, continuous execution, and array reshuffling
  - Ascending completion sweep animation upon array termination

### 2.2 Searching Visualizer
- **Algorithms Implemented**:
  - Linear Search (Sequential scanning across unsorted sequences)
  - Binary Search (Logarithmic interval halving over sorted sequences)
- **Target Specification**:
  - Custom integer target assignment via numeric input
  - Random target selection directly from current active dataset
  - Direct canvas selection by clicking any data card
- **Dynamic Spatial Pointers**:
  - Real-time pointer tags for Binary Search (`L` / Low, `MID` / Median, `R` / High)
  - Active search window bounding
  - Instant grayscale masking for discarded search partitions

### 2.3 Pathfinding & Graph Traversal Visualizer
- **Algorithms Implemented**:
  - Breadth-First Search (Queue-driven traversal guaranteeing shortest path in unweighted graphs)
  - Depth-First Search (Stack-driven deep branch exploration)
  - Dijkstra's Algorithm (Priority queue traversal finding optimal shortest path)
- **Interactive Matrix Canvas**:
  - Click-and-drag barrier drawing and real-time erasing
  - Draggable Start (`Navigation`) and Target (`Target`) nodes for instant repositioning
  - Multi-resolution grid density settings (Coarse 34px, Medium 24px, Fine 16px)
- **Procedural Maze Generators**:
  - Recursive Division (Fractal wall generation with guaranteed traversable passages)
  - Random Obstacle Distribution (Stochastic density barrier generation)
  - Staircase Diagonal Patterns (Structured geometric test patterns)
- **Route Tracking**:
  - Distinct visual states for frontier nodes, visited nodes, obstacle walls, and reconstructed shortest paths
  - Automated path length and node expansion telemetry

### 2.4 Real-Time Web Audio Synthesizer
- Generates procedural audio feedback synchronized with algorithmic state transitions
- Dynamically maps array values and grid coordinates logarithmically to audio frequencies (180 Hz to 900 Hz)
- Dedicated sonic textures for comparisons (triangle waveform), swaps (sine waveform), grid visits, and algorithm completion chords
- Hardware-accelerated with zero external media files or audio latency

### 2.5 Asymptotic Complexity & Pseudocode Engine
- Structured Big-O matrix detailing Best Case, Average Case, Worst Case, and Space Complexity
- Color-coded complexity tags (e.g., green for O(1)/O(log n), amber for O(n log n), orange for O(n^2))
- Formatted, syntax-highlighted algorithmic pseudocode with line numbers and one-click clipboard copying

### 2.6 Claymorphic Design System
- Ergonomic, natural design language rejecting harsh neon glows in favor of tactile depth
- Slate Dark Mode (deep obsidian and titanium slate) and Warm Porcelain Light Mode (warm oatmeal and porcelain)
- Debossed inset stage trays, convex interactive controls, and fluid micro-transitions

---

## 3. How It Does It: System Architecture & Engineering

AlgoViz Studio is built on a decoupled, deterministic architecture where algorithmic logic is completely separated from rendering and scheduling.

```
+------------------------------------------------------------------+
|                     User Interface Layer                         |
|  (React 18 + Lucide Icons + Claymorphic CSS Engine + Sonner)     |
+---------------------------------+--------------------------------+
                                  |
                                  | Dispatches User Actions
                                  v
+---------------------------------+--------------------------------+
|                 Execution Orchestration Layer                    |
|                   (useAlgorithmRunner Hook)                      |
|                                                                  |
|   Controls: Play / Pause / Step / Reset / Speed Scaling          |
|   Scheduler: setTimeout + Dynamic Interval Calibration          |
+--------+------------------------------------------------+--------+
         |                                                |
         | Iterates Generator                             | Triggers Audio
         v                                                v
+--------+-----------------------+      +-----------------+--------+
|    Algorithm Engine Layer      |      |   Acoustic Synthesis     |
| (Pure TypeScript Generators)   |      |    (Web Audio API)       |
|                                |      |                          |
|  function* (data) {            |      |  OscillatorNode          |
|    while (...) {               |      |  GainNode Envelope       |
|      yield { ...stepState };   |      |  Microtonal Frequency    |
|    }                           |      +--------------------------+
|  }                             |
+--------------------------------+
```

### 3.1 The Decoupled Generator Pattern

Traditional visualizer implementations frequently rely on `async`/`await` functions wrapped around `sleep(ms)` promises. That design tightly couples algorithmic execution to browser wall-clock time, rendering pausing, single-stepping, speed adjustments, and clean resets difficult to coordinate without race conditions.

AlgoViz Studio implements all algorithms as pure TypeScript generator functions (`function*`):

- **Zero Framework Coupling**: Algorithm files (`sorting.ts`, `searching.ts`, `pathfinding.ts`) contain zero React code, zero DOM manipulation, and zero asynchronous timing logic.
- **Atomic State Yields**: Every operational step (a comparison between index `i` and `j`, an element swap, or a node visitation) yields an immutable, strongly-typed snapshot (`SortStep`, `SearchStep`, or `PathStep`).
- **Deterministic Stepping**: Because generators pause execution indefinitely until `.next()` is called, the runner can step through code one discrete operation at a time, pause indefinitely without active CPU consumption, or fast-forward at varying clock rates.

### 3.2 Asynchronous Runner & Clock Scheduling (`useAlgorithmRunner`)

The `useAlgorithmRunner` custom React hook acts as the operational clock driving the generator:

1. **Lifecycle Management**: When playback begins, the hook stores the generator instance in a mutable React reference (`useRef`), ensuring state survives re-renders.
2. **Clock Interval Scaling**: Speed values (1 to 5) map through an inverse exponential function to compute millisecond delays ($delay = f(speed)$), allowing real-time speed transitions without restarting the algorithm.
3. **Execution Loop**: A recursive timer loop requests the next yielded state from the generator, transfers the step payload to the view's React state, invokes the audio synthesizer, and schedules the subsequent frame.
4. **Cancellation Safety**: When reset, unmounted, or switched to another algorithm, active timeouts are immediately cleared and the internal generator reference is discarded, preventing memory leaks and stale state updates.

### 3.3 Hardware-Accelerated Procedural Audio Engine (`Web Audio API`)

The audio system (`src/utils/audio.ts`) operates directly on the browser's native `AudioContext`:

- **Oscillator Instantiation**: Each audio cue dynamically spins up a short-lived `OscillatorNode` paired with a dedicated `GainNode`.
- **Logarithmic Frequency Scaling**: For an element of value $v$ within maximum range $M$, frequency is computed via:
  $$f = f_{min} + \left(\frac{v}{M}\right) \times (f_{max} - f_{min})$$
  This maps values between 180 Hz and 900 Hz, allowing human ears to perceive sorting progression as an ascending musical scale.
- **Click-Free Gain Envelopes**: To eliminate acoustic pops caused by abrupt waveform termination, the engine utilizes `exponentialRampToValueAtTime` to decay amplitude smoothly to 0.0001 within 40 ms to 80 ms before stopping and disconnecting the node.

### 3.4 Matrix Representation & Graph Coordinates

In the pathfinding module:
- Obstacles are stored in a contiguous 2D grid matrix (`Grid = number[][]`).
- Visited nodes and frontier boundaries are maintained as hash sets (`Set<string>`) using string-serialized coordinate keys (`r,c`).
- Lookups occur in $O(1)$ time, allowing the visualizer to evaluate large grid matrices (over 1,500 active cells) at 60 FPS without frame drops.
- Path reconstruction executes via a backwards traversal of child-to-parent pointers stored in an associative map during the search phase.

### 3.5 Claymorphic Design System & CSS Tokenization

The visual layout avoids heavy JavaScript animation libraries (such as Framer Motion or GSAP) to maintain maximum rendering performance and zero runtime bundle bloat:

- **Bilateral Clay Shadows**: Each interactive surface incorporates a 4-layer shadow combining positive ambient drop shadows with negative top-left specular highlights, coupled with inner deboss beveling:
  ```css
  --clay-shadow-md:
    5px 5px 14px rgba(0, 0, 0, 0.32),
    -3px -3px 10px rgba(255, 255, 255, 0.03),
    inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.07),
    inset -2px -2px 4px rgba(0, 0, 0, 0.28);
  ```
- **CSS Hardware Acceleration**: Element state changes utilize CSS transitions over `transform` and `background-color`, leveraging GPU compositor layers for fluid rendering.

---

## 4. Technical Stack Breakdown

The platform is engineered using modern web technologies selected specifically for runtime performance, strict type safety, and minimal bundle overhead:

| Layer / Dependency | Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Core Framework** | React 18 | Component tree isolation, declarative UI updates, and fine-grained hook lifecycle management. |
| **Language System** | TypeScript 5 | Complete end-to-end static typing, strict null safety, Discriminated Unions for generator step payloads, and shared interface contracts. |
| **Build & Bundler Tooling** | Vite 5 | Native ES modules during development for instant Hot Module Replacement (HMR) and Rollup-optimized production builds. |
| **Vector Iconography** | Lucide React | Unified, modern vector iconography replacing non-standard system emojis with scalable, accessible SVG elements. |
| **Notification Engine** | Sonner | High-performance, lightweight toast notification dispatching for algorithmic events, clipboard actions, and audio status changes. |
| **Audio Processing** | Web Audio API | Zero-dependency, low-latency procedural frequency generation and gain envelope automation directly in hardware. |
| **Styling & Design System** | Vanilla Modern CSS | Custom CSS variables, claymorphic dual-theme palettes, CSS Grid layouts, and responsive flex containers with zero CSS-in-JS runtime tax. |
| **Fonts & Typography** | Google Fonts | High-legibility modern typefaces: *Plus Jakarta Sans* (Brand & Display), *Inter* (UI Controls & Labels), and *JetBrains Mono* (Code, Telemetry & Big-O). |

---

## 5. Architectural Directory Layout

```
algoviz-react/
├── index.html                    SEO-optimized HTML entry point with Schema.org JSON-LD
├── package.json                  Manifest and project metadata
├── tsconfig.json                 Root TypeScript compiler configuration
├── tsconfig.app.json             Client application compiler configuration
├── tsconfig.node.json            Node/Vite tooling compiler configuration
├── vite.config.ts                Vite build configuration and plugins
└── src/
    ├── main.tsx                  React DOM hydration entry point
    ├── App.tsx                   Root application orchestrator, mode routing, and global toast container
    ├── styles/
    │   └── global.css            Claymorphic design tokens, dual-theme palettes, and visualizer layouts
    ├── algorithms/
    │   ├── sorting.ts            Sorting generator functions, algorithmic metadata, and Big-O bounds
    │   ├── searching.ts          Searching generator functions, bounds calculations, and pseudocode
    │   ├── pathfinding.ts        BFS, DFS, Dijkstra generator functions and queue data structures
    │   └── mazes.ts              Recursive division, random obstacle, and staircase terrain generators
    ├── hooks/
    │   ├── useAlgorithmRunner.ts Asynchronous generator scheduler, play/pause clock, and step sequencer
    │   └── useTheme.ts           Local-storage persistent light/dark theme manager
    ├── utils/
    │   └── audio.ts              Web Audio API procedural sound synthesizer and envelope controller
    ├── components/
    │   ├── AlgoSelect.tsx        Algorithm selector with custom chevron and description blurb
    │   ├── Button.tsx            Reusable tactile claymorphic button primitives
    │   ├── ComplexityPanel.tsx   Big-O asymptotic bounds matrix and pseudocode clipboard viewer
    │   ├── Footer.tsx            Application metadata and developer attribution bar
    │   ├── Legend.tsx            Color-coded visualizer state indicator key
    │   ├── RunControls.tsx       Play, pause, single-step, reshuffle, and reset control deck
    │   ├── Slider.tsx            Dual-range tactile slider with fill-level tracking
    │   ├── StatsPanel.tsx        Real-time telemetry displays for comparisons, swaps, and node visits
    │   └── TopBar.tsx            Semantic header, brand logo, mode navigation dock, and quick actions
    └── views/
        ├── SortingView.tsx       Self-contained sorting visualizer view and distribution presets
        ├── SearchingView.tsx     Self-contained searching visualizer view with spatial pointer tags
        └── PathfindingView.tsx   Self-contained pathfinding visualizer view with paintable matrix grid
```

---

## 6. Project Repository & Attribution

Project Repository: [https://github.com/AdityaKumarr77/Algo-Viz](https://github.com/AdityaKumarr77/Algo-Viz)  
Author & Lead Engineer: **Aditya Kumar Jha** ([https://github.com/AdityaKumarr77](https://github.com/AdityaKumarr77))

Released under the MIT License.
