import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";

export async function listExperiencesWithTech(userId: string) {
  const rows = await db.query.experiences.findMany({
    where: eq(experiences.userId, userId),
    orderBy: [desc(experiences.startDate)],
    with: { experienceCompetences: { with: { competence: true } } },
  });

  return rows.map((row) => ({
    ...row,
    technologies: row.experienceCompetences.map((ec) => ec.competence.name),
  }));
}

export async function listExperiencesSummary(userId: string) {
  return db.query.experiences.findMany({
    where: eq(experiences.userId, userId),
    orderBy: [desc(experiences.startDate)],
    columns: { id: true, company: true, title: true },
  });
}

export async function listExperiencesWithPackage(userId: string) {
  return db.query.experiences.findMany({
    where: eq(experiences.userId, userId),
    orderBy: [asc(experiences.startDate)],
    with: { salaryPackage: true },
  });
}

export async function getExperienceWithTech(userId: string, experienceId: string) {
  const row = await db.query.experiences.findFirst({
    where: and(eq(experiences.id, experienceId), eq(experiences.userId, userId)),
    with: { experienceCompetences: { with: { competence: true } }, salaryPackage: true },
  });
  if (!row) return null;

  return { ...row, technologies: row.experienceCompetences.map((ec) => ec.competence.name) };
}
