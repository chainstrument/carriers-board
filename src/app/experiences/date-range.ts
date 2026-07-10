const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" });

export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatter.format(new Date(startDate));
  const end = endDate ? formatter.format(new Date(endDate)) : "présent";
  return `${start} — ${end}`;
}

export function durationLabel(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths} mois`);
  return parts.join(" ");
}
