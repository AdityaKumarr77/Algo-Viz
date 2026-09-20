import { useCallback, useMemo, useState } from "react";
import { SEARCH_ALGOS, type SearchAlgoKey, type SearchStep } from "../algorithms/searching";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";

function buildData(n: number, sorted: boolean): number[] {
  const raw = Array.from({ length: n }, () => Math.floor(Math.random() * 196) + 5);
  return sorted ? [...new Set(raw)].sort((a, b) => a - b) : raw;
}

const LEGEND_ITEMS: [string, string][] = [
  ["var(--bg-panel)", "Unchecked"],
  ["var(--accent-dim)", "In range"],
  ["var(--accent-2)", "Checking"],
  ["var(--success)", "Found"],
];

export function SearchingView() {
  const [size, setSize] = useState(24);
  const [pendingSize, setPendingSize] = useState(24);
  const [speed, setSpeed] = useState(3);
  const [algoKey, setAlgoKey] = useState<SearchAlgoKey>("linear");
  const algo = SEARCH_ALGOS[algoKey];

  const [data, setData] = useState<number[]>(() => buildData(24, false));
  const [target, setTarget] = useState<number>(() => data[Math.floor(Math.random() * data.length)]);
  const [step, setStep] = useState<SearchStep | null>(null);
  const [stepsCount, setStepsCount] = useState(0);

  const buildGenerator = useCallback(() => algo.fn(data, target), [algo, data, target]);

  const handleStep = useCallback((s: SearchStep) => {
    setStep(s);
    setStepsCount((c) => c + 1);
  }, []);

  const runner = useAlgorithmRunner<SearchStep>(buildGenerator, handleStep, delayForSpeed(speed));

  const resetVisual = useCallback(() => {
    runner.reset();
    setStep(null);
    setStepsCount(0);
  }, [runner]);

  const regenerate = useCallback(
    (n: number, algoForData: SearchAlgoKey) => {
      const arr = buildData(n, SEARCH_ALGOS[algoForData].needsSorted);
      setData(arr);
      setTarget(arr[Math.floor(Math.random() * arr.length)]);
      resetVisual();
    },
    [resetVisual]
  );

  const handleAlgoChange = (key: string) => {
    const nextKey = key as SearchAlgoKey;
    setAlgoKey(nextKey);
    regenerate(size, nextKey);
  };

  const handleShuffle = () => regenerate(size, algoKey);

  const handleSizeCommit = (n: number) => {
    setSize(n);
    regenerate(n, algoKey);
  };

  const checking = step?.checking ?? -1;
  const found = step?.found ?? -1;
  const eliminated = step?.eliminated ?? [];
  const range = step?.range;

  const options = useMemo(
    () => Object.entries(SEARCH_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
    []
  );

  return (
    <>
      <main className="layout">
        <aside className="sidebar">
          <AlgoSelect value={algoKey} options={options} blurb={algo.blurb} onChange={handleAlgoChange} />
          <Slider
            label="Data size"
            valueLabel={String(pendingSize)}
            min={6}
            max={60}
            value={pendingSize}
            onChange={setPendingSize}
            onCommit={handleSizeCommit}
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
            onShuffle={handleShuffle}
            onReset={resetVisual}
          />
          <StatsPanel
            label1="Comparisons"
            value1={step?.stats.comparisons ?? 0}
            label2="Eliminated"
            value2={eliminated.length}
            steps={stepsCount}
          />
        </aside>

        <section className="stage">
          <div className="stage-canvas mode-search">
            {data.map((val, i) => {
              const classes = ["search-cell"];
              if (range && i >= range[0] && i <= range[1]) classes.push("is-range");
              if (eliminated.includes(i)) classes.push("is-eliminated");
              if (checking === i) classes.push("is-checking");
              if (found === i) classes.push("is-found");
              return (
                <div className={classes.join(" ")} key={i}>
                  {val}
                </div>
              );
            })}
          </div>
          <Legend items={LEGEND_ITEMS} />
          <p className="algo-blurb" style={{ padding: "0 2px" }}>
            Target: <strong>{target}</strong>
          </p>
        </section>
      </main>

      <ComplexityPanel time={algo.time} space={algo.space} pseudo={algo.pseudo} />
    </>
  );
}
