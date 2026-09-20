interface SliderProps {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
}

export function Slider({ label, valueLabel, min, max, value, onChange, onCommit }: SliderProps) {
  const handleValue = (nextValue: number) => {
    onChange(nextValue);
    onCommit?.(nextValue);
  };

  return (
    <section className="panel-block">
      <h2 className="block-label">
        {label} <span className="value-pill">{valueLabel}</span>
      </h2>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => handleValue(Number(e.target.value))}
        onInput={(e) => handleValue(Number((e.target as HTMLInputElement).value))}
        onMouseUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      />
    </section>
  );
}
