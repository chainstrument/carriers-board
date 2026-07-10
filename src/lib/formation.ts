export const TYPE_OPTIONS = [
  { value: "book", label: "Livre" },
  { value: "course", label: "Cours (Udemy...)" },
  { value: "video", label: "Vidéo (Youtube...)" },
  { value: "article", label: "Article" },
  { value: "watch", label: "Veille" },
] as const;

export const STATUS_OPTIONS = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
] as const;

export function typeLabel(value: string): string {
  return TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function statusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}
