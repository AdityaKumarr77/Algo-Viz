import { Play, Pause, StepForward, Shuffle, RotateCcw } from "lucide-react";
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
          {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          <span>{playing ? "Pause" : "Execute"}</span>
        </Button>

        <Button onClick={onStep} disabled={disabled || playing} className="step-btn">
          <StepForward size={15} />
          <span>Step</span>
        </Button>
      </div>

      <div className="controls-row secondary-row">
        <Button onClick={onShuffle} className="shuffle-btn">
          <Shuffle size={14} />
          <span>{shuffleLabel}</span>
        </Button>

        <Button onClick={onReset} className="reset-btn">
          <RotateCcw size={14} />
          <span>Reset</span>
        </Button>
      </div>
    </section>
  );
}