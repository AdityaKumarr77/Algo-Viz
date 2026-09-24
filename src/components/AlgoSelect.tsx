interface AlgoSelectProps {
  value: string;
  options: { key: string; label: string }[];
  blurb: string;
  onChange: (key: string) => void;
}

export function AlgoSelect({ value, options, blurb, onChange }: AlgoSelectProps) {
  return (
    <section className="panel-block algo-select-block">
      <div className="block-header">
        <span className="block-icon">⚡</span>
        <h2 className="block-label-text">Select Algorithm</h2>
      </div>
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Select algorithm">
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
      <p className="algo-blurb">{blurb}</p>
    </section>
  );
}
