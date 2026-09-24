import { useState } from "react";

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
    setTimeout(() => setCopied(false), 2000);
  };

  const pseudoLines = pseudo.split("\n");

  return (
    <section className="lowerpanel">
      <div className="lp-col lp-complexity">
        <div className="lp-header">
          <div className="lp-title-wrap">
            <span className="lp-icon">📈</span>
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
            <span className="lp-icon">💻</span>
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
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
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
