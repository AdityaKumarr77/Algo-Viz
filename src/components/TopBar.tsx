import type { Mode } from "../App";

interface TopBarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const MODES: { key: Mode; label: string }[] = [
  { key: "sorting", label: "Sorting" },
  { key: "searching", label: "Searching" },
  { key: "pathfinding", label: "Pathfinding" },
];

export function TopBar({ mode, setMode }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" width="26" height="26">
            <rect x="2" y="16" width="4" height="10" rx="1" />
            <rect x="9" y="10" width="4" height="16" rx="1" />
            <rect x="16" y="4" width="4" height="22" rx="1" />
            <rect x="23" y="12" width="4" height="14" rx="1" />
          </svg>
        </span>
        <span className="brand-name">AlgoViz</span>
      </div>

      <nav className="mode-switch" role="tablist" aria-label="Visualizer mode">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn${mode === m.key ? " is-active" : ""}`}
            role="tab"
            aria-selected={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
