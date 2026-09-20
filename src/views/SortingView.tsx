import { useCallback, useMemo, useState } from "react";
import { SORT_ALGOS, type SortAlgoKey, type SortStep } from "../algorithms/sorting";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";

function randomArray(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 96) + 5);
}

const LEGEND_ITEMS: [string, string][] = [
  ["var(--accent-dim)", "Unsorted"],
  ["var(--accent-2)", "Comparing"],
  ["var(--accent)", "Swapping"],
  ["var(--accent-3)", "Pivot"],
  ["var(--success)", "Sorted"],
];

export function SortingView() {
  const [size, setSize] = useState(40);
  const [pendingSize, setPendingSize] = useState(40);
  const [speed, setSpeed] = useState(3);
  const [algoKey, setAlgoKey] = useState<SortAlgoKey>("bubble");
  const [data, setData] = useState<number[]>(() => randomArray(40));
  const [step, setStep] = useState<SortStep | null>(null);
  const [stepsCount, setStepsCount] = useState(0);

  const algo = SORT_ALGOS[algoKey];

  const buildGenerator = useCallback(() => algo.fn(data), [algo, data]);

  const handleStep = useCallback((s: SortStep) => {
    setStep(s);
    setStepsCount((c) => c + 1);
  }, []);

  const runner = useAlgorithmRunner<SortStep>(buildGenerator, handleStep, delayForSpeed(speed));

  const resetVisual = useCallback(() => {
    runner.reset();
    setStep(null);
    setStepsCount(0);
  }, [runner]);

  const handleAlgoChange = (key: string) => {
    setAlgoKey(key as SortAlgoKey);
    resetVisual();
  };

  const handleShuffle = () => {
    setData(randomArray(size));
    resetVisual();
  };

  const handleSizeCommit = (n: number) => {
    setSize(n);
    setData(randomArray(n));
    resetVisual();
  };

  const displayArray = step?.array ?? data;
  const max = Math.max(...displayArray, 1);
  const comparing: number[] = step?.comparing ?? [];
  const swapping: number[] = step?.swapping ?? [];
  const sortedMark: number[] = step?.sortedMark ?? [];
  const pivot = step?.pivot ?? -1;

  const options = useMemo(
    () => Object.entries(SORT_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
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
            max={100}
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
            label2="Swaps"
            value2={step?.stats.swaps ?? 0}
            steps={stepsCount}
          />
        </aside>

        <section className="stage">
          <div className="stage-canvas">
            {displayArray.map((val, i) => {
              const classes = ["bar"];
              if (sortedMark.includes(i)) classes.push("is-sorted");
              if (comparing.includes(i)) classes.push("is-comparing");
              if (swapping.includes(i)) classes.push("is-active");
              if (pivot === i) classes.push("is-pivot");
              return (
                <div className="bar-col" key={i}>
                  <div className={classes.join(" ")} style={{ height: `${Math.max(2, (val / max) * 100)}%` }} />
                </div>
              );
            })}
          </div>
          <Legend items={LEGEND_ITEMS} />
        </section>
      </main>

      <ComplexityPanel time={algo.time} space={algo.space} pseudo={algo.pseudo} />
    </>
  );
}
