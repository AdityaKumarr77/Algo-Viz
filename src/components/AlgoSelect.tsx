import { Zap, ChevronDown } from "lucide-react";

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
        <span className="block-icon">
          <Zap size={15} />
        </span>
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
          <ChevronDown size={14} />
        </span>
      </div>
      <p className="algo-blurb">{blurb}</p>
    </section>
  );
}
