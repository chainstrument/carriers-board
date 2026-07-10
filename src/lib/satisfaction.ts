import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { satisfactionEntries, type SatisfactionEntry } from "@/lib/db/schema";

export const CRITERIA: { key: keyof SatisfactionEntry; label: string }[] = [
  { key: "stress", label: "Stress" },
  { key: "salary", label: "Salaire" },
  { key: "team", label: "Équipe" },
  { key: "management", label: "Management" },
  { key: "remoteWork", label: "Télétravail" },
  { key: "workplace", label: "Locaux" },
  { key: "workLifeBalance", label: "Équilibre vie perso" },
  { key: "technicalInterest", label: "Intérêt technique" },
  { key: "autonomy", label: "Autonomie" },
  { key: "companyVision", label: "Vision entreprise" },
];

export function averageScore(entry: SatisfactionEntry): number {
  const sum = CRITERIA.reduce((acc, c) => acc + (entry[c.key] as number), 0);
  return sum / CRITERIA.length;
}

export async function listSatisfactionEntries(userId: string) {
  return db.query.satisfactionEntries.findMany({
    where: eq(satisfactionEntries.userId, userId),
    orderBy: [asc(satisfactionEntries.month)],
  });
}
