import { Button } from "./Button";

interface RunControlsProps {
  playing: boolean;
  disabled: boolean;
  onToggle: () => void;
  onStep: () => void;
  onShuffle: () => void;
  onReset: () => void;
  shuffleLabel?: string;
}

export function RunControls({
  playing,
  disabled,
  onToggle,
  onStep,
  onShuffle,
  onReset,
  shuffleLabel = "New data",
}: RunControlsProps) {
  return (
    <section className="controls-group">
      <div className="controls-row primary-row">
        <Button
          variant="primary"
          onClick={onToggle}
          disabled={disabled}
          className={`play-btn${playing ? " is-playing" : ""}`}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
          <span>{playing ? "Pause" : "Execute"}</span>
        </Button>

        <Button onClick={onStep} disabled={disabled || playing} className="step-btn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" strokeLinecap="round" />
          </svg>
          <span>Step</span>
        </Button>
      </div>

      <div className="controls-row secondary-row">
        <Button onClick={onShuffle} className="shuffle-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          <span>{shuffleLabel}</span>
        </Button>

        <Button onClick={onReset} className="reset-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <polyline points="3 3 3 8 8 8" />
          </svg>
          <span>Reset</span>
        </Button>
      </div>
    </section>
  );
}
