export function LevelDots({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-xs text-neutral-400">—</span>;
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < value ? "bg-neutral-700 dark:bg-neutral-300" : "bg-neutral-200 dark:bg-neutral-800"}`}
        />
      ))}
    </span>
  );
}
