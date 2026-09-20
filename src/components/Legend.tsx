interface LegendProps {
  items: [color: string, label: string][];
}

export function Legend({ items }: LegendProps) {
  return (
    <div className="legend">
      {items.map(([color, label]) => (
        <span key={label}>
          <i style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
