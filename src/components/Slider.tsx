import type { ReactNode } from "react";

interface SliderProps {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  value: number;
  icon?: ReactNode;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
}

export function Slider({ label, valueLabel, min, max, value, icon, onChange, onCommit }: SliderProps) {
  const handleValue = (nextValue: number) => {
    onChange(nextValue);
    onCommit?.(nextValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <section className="panel-block slider-block">
      <div className="block-label">
        <div className="label-with-icon">
          {icon && <span className="slider-icon">{icon}</span>}
          <span>{label}</span>
        </div>
        <span className="value-pill">{valueLabel}</span>
      </div>
      <div className="slider-track-wrap">
        <input
          type="range"
          className="slider"
          min={min}
          max={max}
          value={value}
          style={{ "--fill-pct": `${percentage}%` } as React.CSSProperties}
          onChange={(e) => handleValue(Number(e.target.value))}
          onInput={(e) => handleValue(Number((e.target as HTMLInputElement).value))}
          onMouseUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
          aria-label={label}
        />
      </div>
    </section>
  );
}
