import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export async function listProjectsWithTech(userId: string) {
  const rows = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: [desc(projects.createdAt)],
    with: { projectCompetences: { with: { competence: true } }, experience: true },
  });

  return rows.map((row) => ({
    ...row,
    technologies: row.projectCompetences.map((pc) => pc.competence.name),
  }));
}

export async function getProjectWithTech(userId: string, projectId: string) {
  const row = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    with: { projectCompetences: { with: { competence: true } }, experience: true },
  });
  if (!row) return null;

  return { ...row, technologies: row.projectCompetences.map((pc) => pc.competence.name) };
}
