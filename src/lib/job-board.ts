export const STATUS_OPTIONS = [
  { value: "to_review", label: "À regarder" },
  { value: "hr_contact", label: "Contact RH" },
  { value: "technical_test", label: "Test technique" },
  { value: "offer", label: "Offre" },
  { value: "rejected", label: "Refus" },
  { value: "accepted", label: "Accepté" },
] as const;

export function statusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
