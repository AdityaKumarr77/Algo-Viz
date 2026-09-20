interface ComplexityPanelProps {
  time: readonly [string, string, string];
  space: string;
  pseudo: string;
}

export function ComplexityPanel({ time, space, pseudo }: ComplexityPanelProps) {
  const rows: [string, string][] = [
    ["Best", time[0]],
    ["Average", time[1]],
    ["Worst", time[2]],
    ["Space", space],
  ];

  return (
    <section className="lowerpanel">
      <div className="lp-col lp-complexity">
        <h3 className="lp-title">Complexity</h3>
        <table className="complexity-table">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lp-col lp-pseudocode">
        <h3 className="lp-title">Pseudocode</h3>
        <pre className="pseudo">{pseudo}</pre>
      </div>
    </section>
  );
}
