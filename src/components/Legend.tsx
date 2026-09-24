interface LegendProps {
  items: [color: string, label: string][];
}

export function Legend({ items }: LegendProps) {
  return (
    <div className="legend-strip" role="region" aria-label="Visualizer state legend">
      {items.map(([color, label]) => (
        <div className="legend-chip" key={label}>
          <span className="legend-dot" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="legend-text">{label}</span>
        </div>
      ))}
    </div>
  );
}
