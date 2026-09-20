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
    <>
      <section className="panel-block controls-row">
        <Button variant="primary" onClick={onToggle} disabled={disabled}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="16" height="16">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}
          <span>{playing ? "Pause" : "Run"}</span>
        </Button>
        <Button onClick={onStep} disabled={disabled || playing}>
          Step
        </Button>
      </section>
      <section className="panel-block controls-row">
        <Button onClick={onShuffle}>{shuffleLabel}</Button>
        <Button onClick={onReset}>Reset</Button>
      </section>
    </>
  );
}
