export const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
] as const;

export const STATUS_OPTIONS = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Atteint" },
  { value: "abandoned", label: "Abandonné" },
] as const;

export function priorityLabel(value: string): string {
  return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function statusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
