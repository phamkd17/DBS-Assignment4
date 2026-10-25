// A tiny trend line: 2px ink line with the latest session as a dot. Decorative; the numbers beside it carry the meaning.
export function Sparkline({
  values,
  width = 96,
  height = 28,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) =>
    values.length === 1
      ? width / 2
      : pad + (i * (width - pad * 2)) / (values.length - 1);
  const y = (v: number) =>
    max === min
      ? height / 2
      : height - pad - ((v - min) / span) * (height - pad * 2);
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = values.length - 1;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      {values.length > 1 && (
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-ls-ink)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <circle
        cx={x(last)}
        cy={y(values[last])}
        r={4}
        fill="var(--color-ls-ink)"
        stroke="var(--color-ls-surface)"
        strokeWidth={2}
      />
    </svg>
  );
}
