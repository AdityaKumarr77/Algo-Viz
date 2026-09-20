import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATH_ALGOS, cellKey, type Cell, type Grid, type PathAlgoKey, type PathStep } from "../algorithms/pathfinding";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";
import { Button } from "../components/Button";

const DENSITY_LABELS = ["Coarse", "Medium", "Fine"];
const DENSITY_PX = [34, 24, 16];

const LEGEND_ITEMS: [string, string][] = [
  ["var(--success)", "Start"],
  ["var(--accent-2)", "End"],
  ["var(--line-soft)", "Wall"],
  ["var(--accent-dim)", "Visited"],
  ["var(--accent-3)", "Frontier"],
  ["var(--accent)", "Path"],
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
  const [stats, setStats] = useState({ visited: 0, frontierCount: 0, steps: 0 });

  const buildGrid = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cellPx = DENSITY_PX[density - 1];
    const nextCols = Math.max(8, Math.floor((rect.width - 20) / cellPx));
    const nextRows = Math.max(6, Math.floor((rect.height - 20) / cellPx));
    setRows(nextRows);
    setCols(nextCols);
    setWalls(emptyWalls(nextRows, nextCols));
    setStart([Math.floor(nextRows / 2), Math.max(1, Math.floor(nextCols * 0.12))]);
    setEnd([Math.floor(nextRows / 2), Math.min(nextCols - 2, Math.floor(nextCols * 0.88))]);
    setVisited(new Set());
    setFrontier(new Set());
    setPath(new Set());
    setStats({ visited: 0, frontierCount: 0, steps: 0 });
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
    if (s.path) setPath(new Set(s.path));
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
    setStats({ visited: 0, frontierCount: 0, steps: 0 });
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
    if (!mode) return;
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

  const clearWalls = () => {
    setWalls(emptyWalls(rows, cols));
    resetVisual();
  };

  const options = useMemo(
    () => Object.entries(PATH_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
    []
  );

  const cells = useMemo(() => {
    const out: { r: number; c: number; classes: string }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = cellKey(r, c);
        const classes = ["grid-cell"];
        if (r === start[0] && c === start[1]) classes.push("is-start");
        else if (r === end[0] && c === end[1]) classes.push("is-end");
        else if (walls[r]?.[c] === 1) classes.push("is-wall");
        else if (path.has(key)) classes.push("is-path");
        else if (visited.has(key)) classes.push("is-visited");
        else if (frontier.has(key)) classes.push("is-frontier");
        out.push({ r, c, classes: classes.join(" ") });
      }
    }
    return out;
  }, [rows, cols, start, end, walls, visited, frontier, path]);

  return (
    <>
      <main className="layout">
        <aside className="sidebar">
          <AlgoSelect value={algoKey} options={options} blurb={algo.blurb} onChange={handleAlgoChange} />
          <Slider
            label="Grid density"
            valueLabel={DENSITY_LABELS[density - 1]}
            min={1}
            max={3}
            value={density}
            onChange={setDensity}
          />
          <Slider
            label="Speed"
            valueLabel={["Slowest", "Slow", "Normal", "Fast", "Fastest"][speed - 1]}
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
            shuffleLabel="New grid"
          />
          <section className="panel-block">
            <p className="hint-text">
              Click and drag on the grid to draw walls. Drag the green and red nodes to move start and end.
            </p>
            <Button block onClick={clearWalls}>
              Clear walls
            </Button>
          </section>
          <StatsPanel
            label1="Visited cells"
            value1={stats.visited}
            label2="Frontier"
            value2={stats.frontierCount}
            steps={stats.steps}
          />
        </aside>

        <section className="stage">
          <div className="stage-canvas mode-grid" ref={stageRef}>
            <div
              className="grid-wrap"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
            >
              {cells.map(({ r, c, classes }) => (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  onMouseDown={() => handleCellDown(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                />
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
