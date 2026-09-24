import { useCallback, useMemo, useState } from "react";
import { SEARCH_ALGOS, type SearchAlgoKey, type SearchStep } from "../algorithms/searching";
import { useAlgorithmRunner, delayForSpeed } from "../hooks/useAlgorithmRunner";
import { AlgoSelect } from "../components/AlgoSelect";
import { Slider } from "../components/Slider";
import { RunControls } from "../components/RunControls";
import { StatsPanel } from "../components/StatsPanel";
import { Legend } from "../components/Legend";
import { ComplexityPanel } from "../components/ComplexityPanel";
import { sound } from "../utils/audio";

function buildData(n: number, sorted: boolean): number[] {
  const raw = Array.from({ length: n }, () => Math.floor(Math.random() * 190) + 10);
  return sorted ? [...new Set(raw)].sort((a, b) => a - b) : raw;
}

const LEGEND_ITEMS: [string, string][] = [
  ["var(--bg-panel)", "Unchecked"],
  ["var(--accent-dim)", "Search Window"],
  ["var(--accent-2)", "Evaluating"],
  ["var(--success)", "Target Found"],
];

export function SearchingView() {
  const [size, setSize] = useState(24);
  const [pendingSize, setPendingSize] = useState(24);
  const [speed, setSpeed] = useState(3);
  const [algoKey, setAlgoKey] = useState<SearchAlgoKey>("linear");
  const algo = SEARCH_ALGOS[algoKey];

  const [data, setData] = useState<number[]>(() => buildData(24, false));
  const [target, setTarget] = useState<number>(() => data[Math.floor(Math.random() * data.length)]);
  const [customInput, setCustomInput] = useState<string>(() => String(target));
  const [step, setStep] = useState<SearchStep | null>(null);
  const [stepsCount, setStepsCount] = useState(0);

  const buildGenerator = useCallback(() => algo.fn(data, target), [algo, data, target]);

  const handleStep = useCallback(
    (s: SearchStep) => {
      setStep(s);
      setStepsCount((c) => c + 1);

      if (s.checking !== undefined && s.checking >= 0) {
        sound.playCompare(data[s.checking] ?? 50, 200);
      }
      if (s.found !== undefined && s.found >= 0) {
        sound.playTargetFound();
      }
    },
    [data]
  );

  const runner = useAlgorithmRunner<SearchStep>(buildGenerator, handleStep, delayForSpeed(speed));

  const resetVisual = useCallback(() => {
    runner.reset();
    setStep(null);
    setStepsCount(0);
  }, [runner]);

  const regenerate = useCallback(
    (n: number, algoForData: SearchAlgoKey, newTarget?: number) => {
      const arr = buildData(n, SEARCH_ALGOS[algoForData].needsSorted);
      setData(arr);
      const chosenTarget = newTarget ?? arr[Math.floor(Math.random() * arr.length)];
      setTarget(chosenTarget);
      setCustomInput(String(chosenTarget));
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

  const handleSelectTargetFromCell = (val: number) => {
    if (runner.playing) return;
    setTarget(val);
    setCustomInput(String(val));
    resetVisual();
  };

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed)) {
      setTarget(parsed);
      resetVisual();
    }
  };

  const pickRandomTarget = () => {
    const chosen = data[Math.floor(Math.random() * data.length)];
    setTarget(chosen);
    setCustomInput(String(chosen));
    resetVisual();
  };

  const checking = step?.checking ?? -1;
  const found = step?.found ?? -1;
  const eliminated = step?.eliminated ?? [];
  const range = step?.range;
  const notFound = Boolean(step?.notFound);
  const isFinished = Boolean(step?.done);

  const options = useMemo(
    () => Object.entries(SEARCH_ALGOS).map(([key, meta]) => ({ key, label: meta.label })),
    []
  );

  const speedLabels = ["0.25x", "0.5x", "1.0x", "2.0x", "5.0x"];

  return (
    <>
      <main className="layout">
        <aside className="sidebar">
          <AlgoSelect value={algoKey} options={options} blurb={algo.blurb} onChange={handleAlgoChange} />

          {/* Interactive Target Setter */}
          <section className="panel-block target-picker-block">
            <h2 className="block-label">
              <span>Target Value</span>
              <span className="value-pill target-pill">Target: {target}</span>
            </h2>
            <form onSubmit={handleTargetSubmit} className="target-input-row">
              <input
                type="number"
                className="target-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Target number"
                disabled={runner.playing}
              />
              <button type="submit" className="btn btn-ghost target-set-btn" disabled={runner.playing}>
                Set
              </button>
              <button
                type="button"
                className="btn btn-ghost target-rnd-btn"
                onClick={pickRandomTarget}
                title="Pick random element from array"
                disabled={runner.playing}
              >
                🎲
              </button>
            </form>
            <p className="hint-text">Tip: Click on any card below to set it as target.</p>
          </section>

          <Slider
            label="Array Size"
            valueLabel={`${pendingSize} items`}
            icon="📏"
            min={6}
            max={50}
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
            shuffleLabel="Regenerate"
          />

          <StatsPanel
            label1="Comparisons"
            value1={step?.stats.comparisons ?? 0}
            label2="Eliminated"
            value2={eliminated.length}
            steps={stepsCount}
            status={
              found >= 0
                ? "Target Found!"
                : notFound
                ? "Not Found"
                : runner.playing
                ? "Searching..."
                : "Ready"
            }
            isComplete={isFinished}
          />
        </aside>

        <section className="stage">
          <div className="stage-header-bar">
            <div className="stage-title-group">
              <span className="stage-badge">Searching Stage</span>
              <span className="stage-info-text">
                Target: <strong className="target-highlight">{target}</strong>
                {found >= 0 && (
                  <span className="found-tag"> — Found at index {found}! 🎉</span>
                )}
                {notFound && <span className="notfound-tag"> — Value not present in array.</span>}
              </span>
            </div>
          </div>

          <div className="stage-canvas mode-search">
            <div className="search-grid-wrap">
              {data.map((val, i) => {
                const classes = ["search-cell"];
                const isTarget = val === target;
                if (isTarget) classes.push("is-board-target");
                if (range && i >= range[0] && i <= range[1]) classes.push("is-range");
                if (eliminated.includes(i)) classes.push("is-eliminated");
                if (checking === i) classes.push("is-checking");
                if (found === i) classes.push("is-found");

                // Pointer indicators for binary search
                const isLow = range && range[0] === i;
                const isHigh = range && range[1] === i;
                const isMid = checking === i;

                return (
                  <div
                    className={classes.join(" ")}
                    key={i}
                    onClick={() => handleSelectTargetFromCell(val)}
                    title={`Index ${i}: Value ${val} (Click to set as target)`}
                  >
                    {/* Floating Pointers */}
                    {(isLow || isHigh || isMid) && (
                      <div className="pointer-wrap">
                        {isLow && <span className="pointer-tag ptr-low">L</span>}
                        {isMid && <span className="pointer-tag ptr-mid">MID</span>}
                        {isHigh && range[0] !== range[1] && <span className="pointer-tag ptr-high">R</span>}
                      </div>
                    )}
                    <span className="cell-val">{val}</span>
                    <span className="cell-idx">#{i}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Legend items={LEGEND_ITEMS} />
        </section>
      </main>

      <ComplexityPanel time={algo.time} space={algo.space} pseudo={algo.pseudo} />
    </>
  );
}
