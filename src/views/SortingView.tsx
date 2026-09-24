import { useCallback, useMemo, useState } from "react";
import {
  SORT_ALGOS,
  generateArray,
  type ArrayDistribution,
  type SortAlgoKey,
  type SortStep,
} from "../algorithms/sorting";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";
import { sound } from "../utils/audio";

const LEGEND_ITEMS: [string, string][] = [
  ["var(--bar-default)", "Unsorted"],
  ["var(--accent-2)", "Comparing"],
  ["var(--accent)", "Swapping"],
  ["var(--accent-3)", "Pivot"],
  ["var(--success)", "Sorted"],
];

const DISTRIBUTIONS: { key: ArrayDistribution; label: string; icon: string }[] = [
  { key: "random", label: "Random", icon: "🎲" },
  { key: "nearly-sorted", label: "Nearly Sorted", icon: "📈" },
  { key: "reversed", label: "Reversed", icon: "📉" },
  { key: "few-unique", label: "Few Unique", icon: "✨" },
  { key: "pyramid", label: "Pyramid", icon: "▲" },
];

export function SortingView() {
  const [size, setSize] = useState(36);
  const [pendingSize, setPendingSize] = useState(36);
  const [speed, setSpeed] = useState(3);
  const [distribution, setDistribution] = useState<ArrayDistribution>("random");
  const [algoKey, setAlgoKey] = useState<SortAlgoKey>("bubble");
  const [data, setData] = useState<number[]>(() => generateArray(36, "random"));
  const [step, setStep] = useState<SortStep | null>(null);
  const [stepsCount, setStepsCount] = useState(0);
  const [sweepIndex, setSweepIndex] = useState(-1);

  const algo = SORT_ALGOS[algoKey];

  const buildGenerator = useCallback(() => algo.fn(data), [algo, data]);

  const handleStep = useCallback(
    (s: SortStep) => {
      setStep(s);
      setStepsCount((c) => c + 1);

      // Audio feedback
      if (s.swapping) {
        sound.playSwap(s.array[s.swapping[0]], 100);
      } else if (s.comparing) {
        sound.playCompare(s.array[s.comparing[0]], 100);
      }

      // Finish celebration sweep
      if (s.done) {
        sound.playSuccess();
        const len = s.array.length;
        for (let i = 0; i <= len; i++) {
          setTimeout(() => {
            setSweepIndex(i);
          }, i * Math.max(12, Math.floor(400 / len)));
        }
      }
    },
    []
  );

  const runner = useAlgorithmRunner<SortStep>(buildGenerator, handleStep, delayForSpeed(speed));

  const resetVisual = useCallback(() => {
    runner.reset();
    setStep(null);
    setStepsCount(0);
    setSweepIndex(-1);
  }, [runner]);

  const handleAlgoChange = (key: string) => {
    setAlgoKey(key as SortAlgoKey);
    resetVisual();
  };

  const handleDistributionChange = (dist: ArrayDistribution) => {
    setDistribution(dist);
    setData(generateArray(size, dist));
    resetVisual();
  };

  const handleShuffle = () => {
    setData(generateArray(size, distribution));
    resetVisual();
  };

  const handleSizeCommit = (n: number) => {
    setSize(n);
    setData(generateArray(n, distribution));
    resetVisual();
  };

  const displayArray = step?.array ?? data;
  const max = Math.max(...displayArray, 1);
  const comparing: number[] = step?.comparing ?? [];
  const swapping: number[] = step?.swapping ?? [];
  const sortedMark: number[] = step?.sortedMark ?? [];
  const pivot = step?.pivot ?? -1;
  const isFinished = Boolean(step?.done);

  const options = useMemo(
    () => Object.entries(SORT_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
    []
  );

  // Speed labels
  const speedLabels = ["0.25x", "0.5x", "1.0x", "2.0x", "5.0x"];

  return (
    <>
      <main className="layout">
        <aside className="sidebar">
          <AlgoSelect value={algoKey} options={options} blurb={algo.blurb} onChange={handleAlgoChange} />

          {/* Distribution Preset Selector */}
          <section className="panel-block">
            <h2 className="block-label">
              <span>Array Distribution</span>
              <span className="value-pill">{distribution}</span>
            </h2>
            <div className="preset-grid">
              {DISTRIBUTIONS.map((d) => (
                <button
                  key={d.key}
                  className={`preset-btn${distribution === d.key ? " is-active" : ""}`}
                  onClick={() => handleDistributionChange(d.key)}
                  title={`Generate ${d.label} Array`}
                >
                  <span className="preset-icon">{d.icon}</span>
                  <span className="preset-label">{d.label}</span>
                </button>
              ))}
            </div>
          </section>

          <Slider
            label="Array Size"
            valueLabel={`${pendingSize} bars`}
            icon="📏"
            min={8}
            max={100}
            value={pendingSize}
            onChange={setPendingSize}
            onCommit={handleSizeCommit}
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
            onShuffle={handleShuffle}
            onReset={resetVisual}
            shuffleLabel="Reshuffle"
          />

          <StatsPanel
            label1="Comparisons"
            value1={step?.stats.comparisons ?? 0}
            label2="Swaps / Shifts"
            value2={step?.stats.swaps ?? 0}
            steps={stepsCount}
            status={runner.playing ? "Sorting..." : runner.finished ? "Sorted" : "Ready"}
            isComplete={isFinished}
          />
        </aside>

        <section className="stage">
          {/* Status banner */}
          <div className="stage-header-bar">
            <div className="stage-title-group">
              <span className="stage-badge">Sorting Stage</span>
              <span className="stage-info-text">
                {isFinished
                  ? `Completed in ${stepsCount} operations!`
                  : runner.playing
                  ? `Visualizing ${algo.label}...`
                  : `Select settings and hit Execute`}
              </span>
            </div>
          </div>

          <div className="stage-canvas">
            {displayArray.map((val, i) => {
              const classes = ["bar"];
              if (isFinished || sortedMark.includes(i)) classes.push("is-sorted");
              if (comparing.includes(i)) classes.push("is-comparing");
              if (swapping.includes(i)) classes.push("is-active");
              if (pivot === i) classes.push("is-pivot");
              if (sweepIndex >= i) classes.push("is-swept");

              const heightPct = Math.max(4, (val / max) * 100);
              const showVal = displayArray.length <= 32;

              return (
                <div className="bar-col" key={i}>
                  <div
                    className={classes.join(" ")}
                    style={{
                      height: `${heightPct}%`,
                      "--bar-val": `${val}`,
                    } as React.CSSProperties}
                  >
                    {showVal && <span className="bar-val-label">{val}</span>}
                  </div>
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
