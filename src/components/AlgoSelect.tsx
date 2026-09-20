interface AlgoSelectProps {
  value: string;
  options: { key: string; label: string }[];
  blurb: string;
  onChange: (key: string) => void;
}

export function AlgoSelect({ value, options, blurb, onChange }: AlgoSelectProps) {
  return (
    <section className="panel-block">
      <h2 className="block-label">Algorithm</h2>
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="algo-blurb">{blurb}</p>
    </section>
  );
}
