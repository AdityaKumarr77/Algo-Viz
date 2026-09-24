import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PATH_ALGOS,
  cellKey,
  type Cell,
  type Grid,
  type PathAlgoKey,
  type PathStep,
} from "../algorithms/pathfinding";
import {
  generateRandomWalls,
  generateRecursiveDivisionMaze,
  generateStairPattern,
} from "../algorithms/mazes";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";
import { sound } from "../utils/audio";

const DENSITY_LABELS = ["Coarse (Large)", "Medium (Standard)", "Fine (Dense)"];
const DENSITY_PX = [34, 24, 16];

const LEGEND_ITEMS: [string, string][] = [
  ["var(--success)", "Start Node"],
  ["var(--accent-2)", "Target Node"],
  ["var(--wall-color)", "Wall / Barrier"],
  ["var(--visited-color)", "Visited Node"],
  ["var(--accent-3)", "Frontier"],
  ["var(--accent)", "Shortest Path"],
];

type DragMode = "start" | "end" | "wall" | "erase" | null;

function emptyWalls(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function PathfindingView() {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragMode>(null);

  const [density, setDensity] = useState(2);
  const [speed, setSpeed] = useState(3);
  const [algoKey, setAlgoKey] = useState<PathAlgoKey>("bfs");
  const algo = PATH_ALGOS[algoKey];

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [walls, setWalls] = useState<Grid>([]);
  const [start, setStart] = useState<Cell>([0, 0]);
  const [end, setEnd] = useState<Cell>([0, 0]);

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [frontier, setFrontier] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Set<string>>(new Set());
  const [pathLength, setPathLength] = useState(0);
  const [stats, setStats] = useState({ visited: 0, frontierCount: 0, steps: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const buildGrid = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cellPx = DENSITY_PX[density - 1];
    const nextCols = Math.max(10, Math.floor((rect.width - 24) / cellPx));
    const nextRows = Math.max(8, Math.floor((rect.height - 24) / cellPx));
    setRows(nextRows);
    setCols(nextCols);
    setWalls(emptyWalls(nextRows, nextCols));
    setStart([Math.floor(nextRows / 2), Math.max(1, Math.floor(nextCols * 0.12))]);
    setEnd([Math.floor(nextRows / 2), Math.min(nextCols - 2, Math.floor(nextCols * 0.88))]);
    setVisited(new Set());
    setFrontier(new Set());
    setPath(new Set());
    setPathLength(0);
    setStats({ visited: 0, frontierCount: 0, steps: 0 });
    setIsCompleted(false);
    setNotFound(false);
  }, [density]);

  useEffect(() => {
    buildGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density]);

  useEffect(() => {
    const onResize = () => buildGrid();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const buildGenerator = useCallback(
    () => algo.fn(walls, rows, cols, start, end),
    [algo, walls, rows, cols, start, end]
  );

  const handleStep = useCallback((s: PathStep) => {
    setVisited(new Set(s.visited ?? []));
    setFrontier(new Set(s.frontier ?? []));
    sound.playVisit();

    if (s.path && s.path.length > 0) {
      setPath(new Set(s.path));
      setPathLength(s.path.length);
      sound.playSuccess();
    }
    if (s.done) {
      setIsCompleted(true);
      if (s.notFound) {
        setNotFound(true);
      }
    }
    setStats((prev) => ({
      visited: s.stats.visited,
      frontierCount: (s.frontier ?? []).length,
      steps: prev.steps + 1,
    }));
  }, []);

  const runner = useAlgorithmRunner<PathStep>(buildGenerator, handleStep, delayForSpeed(speed));

  const resetVisual = useCallback(() => {
    runner.reset();
    setVisited(new Set());
    setFrontier(new Set());
    setPath(new Set());
    setPathLength(0);
    setStats({ visited: 0, frontierCount: 0, steps: 0 });
    setIsCompleted(false);
    setNotFound(false);
  }, [runner]);

  const handleAlgoChange = (key: string) => {
    setAlgoKey(key as PathAlgoKey);
    resetVisual();
  };

  const toggleWall = useCallback((r: number, c: number, isWall: boolean) => {
    setWalls((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = isWall ? 1 : 0;
      return next;
    });
  }, []);

  const handleCellDown = (r: number, c: number) => {
    if (runner.playing) return;
    if (r === start[0] && c === start[1]) {
      dragRef.current = "start";
    } else if (r === end[0] && c === end[1]) {
      dragRef.current = "end";
    } else {
      const isWall = walls[r][c] === 1;
      dragRef.current = isWall ? "erase" : "wall";
      toggleWall(r, c, !isWall);
    }
  };

  const handleCellEnter = (r: number, c: number) => {
    const mode = dragRef.current;
    if (!mode || runner.playing) return;
    const isEndHere = r === end[0] && c === end[1];
    const isStartHere = r === start[0] && c === start[1];
    if (mode === "start" && walls[r][c] !== 1 && !isEndHere) {
      setStart([r, c]);
    } else if (mode === "end" && walls[r][c] !== 1 && !isStartHere) {
      setEnd([r, c]);
    } else if ((mode === "wall" || mode === "erase") && !isStartHere && !isEndHere) {
      toggleWall(r, c, mode === "wall");
    }
  };

  // Maze Generators
  const applyRecursiveMaze = () => {
    if (rows === 0 || cols === 0) return;
    const nextWalls = generateRecursiveDivisionMaze(rows, cols, start, end);
    setWalls(nextWalls);
    resetVisual();
  };

  const applyRandomWalls = () => {
    if (rows === 0 || cols === 0) return;
    const nextWalls = generateRandomWalls(rows, cols, start, end, 0.28);
    setWalls(nextWalls);
    resetVisual();
  };

  const applyStairs = () => {
    if (rows === 0 || cols === 0) return;
    const nextWalls = generateStairPattern(rows, cols, start, end);
    setWalls(nextWalls);
    resetVisual();
  };

  const clearWalls = () => {
    setWalls(emptyWalls(rows, cols));
    resetVisual();
  };

  const clearPathOnly = () => {
    resetVisual();
  };

  const options = useMemo(
    () => Object.entries(PATH_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
    []
  );

  const speedLabels = ["0.25x", "0.5x", "1.0x", "2.0x", "5.0x"];

  const cells = useMemo(() => {
    const out: { r: number; c: number; classes: string; isStart: boolean; isEnd: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = cellKey(r, c);
        const classes = ["grid-cell"];
        const isStart = r === start[0] && c === start[1];
        const isEnd = r === end[0] && c === end[1];

        if (isStart) classes.push("is-start");
        else if (isEnd) classes.push("is-end");
        else if (walls[r]?.[c] === 1) classes.push("is-wall");
        else if (path.has(key)) classes.push("is-path");
        else if (visited.has(key)) classes.push("is-visited");
        else if (frontier.has(key)) classes.push("is-frontier");

        out.push({ r, c, classes: classes.join(" "), isStart, isEnd });
      }
    }
    return out;
  }, [rows, cols, start, end, walls, visited, frontier, path]);

  return (
    <>
      <main className="layout">
        <aside className="sidebar">
          <AlgoSelect value={algoKey} options={options} blurb={algo.blurb} onChange={handleAlgoChange} />

          {/* Maze Generation Presets */}
          <section className="panel-block maze-presets-block">
            <h2 className="block-label">
              <span>Maze & Terrain</span>
              <span className="value-pill">Presets</span>
            </h2>
            <div className="preset-grid">
              <button className="preset-btn" onClick={applyRecursiveMaze} title="Generate recursive division maze">
                <span className="preset-icon">🌀</span>
                <span className="preset-label">Recursive</span>
              </button>
              <button className="preset-btn" onClick={applyRandomWalls} title="Generate random obstacle walls">
                <span className="preset-icon">🎲</span>
                <span className="preset-label">Random</span>
              </button>
              <button className="preset-btn" onClick={applyStairs} title="Generate diagonal stair pattern">
                <span className="preset-icon">🪜</span>
                <span className="preset-label">Stairs</span>
              </button>
              <button className="preset-btn" onClick={clearWalls} title="Remove all walls">
                <span className="preset-icon">🧹</span>
                <span className="preset-label">Clear All</span>
              </button>
            </div>
            <div className="preset-actions-row">
              <button className="btn btn-ghost clear-path-btn" onClick={clearPathOnly}>
                Clear Route
              </button>
            </div>
          </section>

          <Slider
            label="Grid Resolution"
            valueLabel={DENSITY_LABELS[density - 1]}
            icon="📐"
            min={1}
            max={3}
            value={density}
            onChange={setDensity}
          />

          <Slider
            label="Execution Speed"
            valueLabel={speedLabels[speed - 1]}
            icon="⚡"
            min={1}
            max={5}
            value={speed}
            onChange={setSpeed}
          />

          <RunControls
            playing={runner.playing}
            disabled={runner.finished}
            onToggle={runner.toggle}
            onStep={runner.stepOnce}
            onShuffle={buildGrid}
            onReset={resetVisual}
            shuffleLabel="New Grid"
          />

          <section className="panel-block hint-box">
            <div className="hint-header">
              <span>💡</span>
              <span className="hint-title">Interactive Canvas</span>
            </div>
            <p className="hint-text">
              Click & drag to draw or erase barriers. Drag 🚀 (Start) or 🎯 (Target) to reposition.
            </p>
          </section>

          <StatsPanel
            label1="Visited Nodes"
            value1={stats.visited}
            label2="Shortest Path"
            value2={pathLength > 0 ? `${pathLength} nodes` : stats.frontierCount}
            steps={stats.steps}
            status={
              isCompleted && pathLength > 0
                ? "Path Found! 🎯"
                : notFound
                ? "No Path"
                : runner.playing
                ? "Exploring..."
                : "Ready"
            }
            isComplete={isCompleted}
          />
        </aside>

        <section className="stage">
          <div className="stage-header-bar">
            <div className="stage-title-group">
              <span className="stage-badge">Pathfinding Matrix</span>
              <span className="stage-info-text">
                {isCompleted && pathLength > 0
                  ? `Shortest path discovered: ${pathLength} steps! 🎉`
                  : notFound
                  ? `Target unreachable: walls block all paths.`
                  : runner.playing
                  ? `Navigating from start to target using ${algo.label}...`
                  : `Draw walls or choose a maze preset, then hit Execute`}
              </span>
            </div>
          </div>

          <div className="stage-canvas mode-grid" ref={stageRef}>
            <div
              className="grid-wrap"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {cells.map(({ r, c, classes, isStart, isEnd }) => (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  onMouseDown={() => handleCellDown(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                >
                  {isStart && <span className="cell-node-icon">🚀</span>}
                  {isEnd && <span className="cell-node-icon">🎯</span>}
                </div>
              ))}
            </div>
          </div>
          <Legend items={LEGEND_ITEMS} />
        </section>
      </main>

      <ComplexityPanel time={algo.time} space={algo.space} pseudo={algo.pseudo} />
    </>
  );
}
