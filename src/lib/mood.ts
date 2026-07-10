export const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "Très mauvaise" },
  { value: 2, emoji: "🙁", label: "Mauvaise" },
  { value: 3, emoji: "😐", label: "Neutre" },
  { value: 4, emoji: "🙂", label: "Bonne" },
  { value: 5, emoji: "😄", label: "Très bonne" },
] as const;

export function moodEmoji(mood: number | null): string | null {
  return MOOD_OPTIONS.find((o) => o.value === mood)?.emoji ?? null;
}
