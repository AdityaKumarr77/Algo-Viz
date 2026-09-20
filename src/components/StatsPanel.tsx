interface StatsPanelProps {
  label1: string;
  value1: number;
  label2: string;
  value2: number;
  steps: number;
}

export function StatsPanel({ label1, value1, label2, value2, steps }: StatsPanelProps) {
  return (
    <section className="panel-block stats-block">
      <h2 className="block-label">Live stats</h2>
      <dl className="stats-grid">
        <div>
          <dt>{label1}</dt>
          <dd>{value1}</dd>
        </div>
        <div>
          <dt>{label2}</dt>
          <dd>{value2}</dd>
        </div>
        <div>
          <dt>Elapsed steps</dt>
          <dd>{steps}</dd>
        </div>
      </dl>
    </section>
  );
}
