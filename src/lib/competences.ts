import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { competences } from "@/lib/db/schema";

export function computeLastUsed(
  manualLastUsedAt: string | null,
  linkedExperiences: { startDate: string; endDate: string | null }[],
): { date: string | null; source: "experience" | "manual" | null } {
  if (linkedExperiences.length === 0) {
    return { date: manualLastUsedAt, source: manualLastUsedAt ? "manual" : null };
  }

  const today = new Date().toISOString().slice(0, 10);
  const mostRecent = linkedExperiences.reduce((latest, exp) => {
    const end = exp.endDate ?? today;
    return end > latest ? end : latest;
  }, "0000-00-00");

  return { date: mostRecent, source: "experience" };
}

export async function listCompetencesWithUsage() {
  const rows = await db.query.competences.findMany({
    orderBy: [asc(competences.category), asc(competences.name)],
    with: { experienceCompetences: { with: { experience: true } } },
  });

  return rows.map((row) => {
    const linkedExperiences = row.experienceCompetences.map((ec) => ec.experience);
    return {
      ...row,
      linkedExperiences,
      lastUsed: computeLastUsed(row.manualLastUsedAt, linkedExperiences),
    };
  });
}

export async function getCompetenceWithUsage(id: string) {
  const row = await db.query.competences.findFirst({
    where: eq(competences.id, id),
    with: { experienceCompetences: { with: { experience: true } } },
  });
  if (!row) return null;

  const linkedExperiences = row.experienceCompetences.map((ec) => ec.experience);
  return {
    ...row,
    linkedExperiences,
    lastUsed: computeLastUsed(row.manualLastUsedAt, linkedExperiences),
  };
}
