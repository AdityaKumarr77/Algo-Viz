interface StatsPanelProps {
  label1: string;
  value1: number | string;
  label2: string;
  value2: number | string;
  steps: number;
  status?: string;
  isComplete?: boolean;
}

export function StatsPanel({
  label1,
  value1,
  label2,
  value2,
  steps,
  status = "Active",
  isComplete = false,
}: StatsPanelProps) {
  return (
    <section className="panel-block stats-card">
      <div className="stats-header">
        <div className="stats-title-wrap">
          <span className={`stats-pulse-dot${isComplete ? " is-complete" : ""}`} aria-hidden="true" />
          <h2 className="block-label-text">Live Telemetry</h2>
        </div>
        <span className={`stats-status-pill${isComplete ? " is-complete" : ""}`}>
          {isComplete ? "Complete" : status}
        </span>
      </div>

      <div className="stats-grid-cards">
        <div className="stat-card">
          <span className="stat-label">{label1}</span>
          <span className="stat-value primary">{value1}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{label2}</span>
          <span className="stat-value secondary">{value2}</span>
        </div>
        <div className="stat-card full-width">
          <span className="stat-label">Operations / Steps</span>
          <span className="stat-value accent">{steps}</span>
        </div>
      </div>
    </section>
  );
}
