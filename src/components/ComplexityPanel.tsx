import { useState } from "react";
import { TrendingUp, Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ComplexityPanelProps {
  time: readonly [string, string, string];
  space: string;
  pseudo: string;
}

function getBadgeClass(val: string): string {
  const clean = val.toLowerCase();
  if (clean.includes("o(1)") || clean.includes("o(log")) return "badge-excellent";
  if (clean.includes("o(n)") && !clean.includes("n\u00B2") && !clean.includes("n^2")) return "badge-good";
  if (clean.includes("o(n log n)")) return "badge-fair";
  if (clean.includes("o(n\u00B2)") || clean.includes("o(n^2)")) return "badge-warning";
  return "badge-neutral";
}

export function ComplexityPanel({ time, space, pseudo }: ComplexityPanelProps) {
  const [copied, setCopied] = useState(false);

  const rows: [string, string][] = [
    ["Best Case", time[0]],
    ["Average Case", time[1]],
    ["Worst Case", time[2]],
    ["Space Complexity", space],
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(pseudo);
    setCopied(true);
    toast.success("Pseudocode copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const pseudoLines = pseudo.split("\n");

  return (
    <section className="lowerpanel">
      <div className="lp-col lp-complexity">
        <div className="lp-header">
          <div className="lp-title-wrap">
            <span className="lp-icon">
              <TrendingUp size={16} />
            </span>
            <h3 className="lp-title">Asymptotic Complexity</h3>
          </div>
          <span className="lp-subtitle">Big-O Bounds</span>
        </div>

        <div className="complexity-grid">
          {rows.map(([label, value]) => (
            <div className="complexity-row" key={label}>
              <span className="complexity-label">{label}</span>
              <span className={`complexity-badge ${getBadgeClass(value)}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-col lp-pseudocode">
        <div className="lp-header">
          <div className="lp-title-wrap">
            <span className="lp-icon">
              <Code2 size={16} />
            </span>
            <h3 className="lp-title">Algorithm Logic & Pseudocode</h3>
          </div>
          <button
            className="copy-btn"
            onClick={handleCopy}
            title="Copy pseudocode to clipboard"
            aria-label="Copy pseudocode"
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="code-container">
          <div className="code-lines">
            {pseudoLines.map((line, idx) => (
              <div className="code-line" key={idx}>
                <span className="line-num">{idx + 1}</span>
                <span className="line-text">{line || " "}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
