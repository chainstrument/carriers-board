export function Sparkline({
  values,
  min = 1,
  max = 10,
  width = 240,
  height = 48,
}: {
  values: number[];
  min?: number;
  max?: number;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-xs text-neutral-400"
      >
        Pas assez de données
      </div>
    );
  }

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  const last = values[values.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        strokeWidth={2}
        className="stroke-neutral-700 dark:stroke-neutral-300"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.split(",")[0]}
          cy={p.split(",")[1]}
          r={i === values.length - 1 ? 3 : 2}
          className={
            i === values.length - 1
              ? "fill-neutral-900 dark:fill-neutral-100"
              : "fill-neutral-400 dark:fill-neutral-600"
          }
        />
      ))}
      <text
        x={width}
        y={-4}
        textAnchor="end"
        className="fill-neutral-500 text-[10px]"
      >
        {last}/10
      </text>
    </svg>
  );
}
