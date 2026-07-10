"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { competences, projectCompetences, projects } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const projectSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  client: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  impact: z.string().optional(),
  technologies: z.string().optional(),
});

function parseTechnologies(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

async function syncTechnologies(projectId: string, names: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(projectCompetences).where(eq(projectCompetences.projectId, projectId));
    if (names.length === 0) return;

    const existing = await tx.query.competences.findMany({ where: inArray(competences.name, names) });
    const existingNames = new Set(existing.map((c) => c.name));
    const toCreate = names.filter((n) => !existingNames.has(n));

    const created = toCreate.length
      ? await tx.insert(competences).values(toCreate.map((name) => ({ name }))).returning()
      : [];

    const allCompetences = [...existing, ...created];
    await tx.insert(projectCompetences).values(
      allCompetences.map((c) => ({ projectId, competenceId: c.id })),
    );
  });
}

function parsedData(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    client: formData.get("client") || undefined,
    duration: formData.get("duration") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    impact: formData.get("impact") || undefined,
    technologies: formData.get("technologies") || undefined,
  });
}

export async function createProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: d.name,
      client: d.client || null,
      duration: d.duration || null,
      difficulty: d.difficulty ?? null,
      impact: d.impact || null,
    })
    .returning();

  await syncTechnologies(project.id, parseTechnologies(d.technologies));

  revalidatePath("/projets");
  redirect(`/projets/${project.id}`);
}

export async function updateProject(
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(projects)
    .set({
      name: d.name,
      client: d.client || null,
      duration: d.duration || null,
      difficulty: d.difficulty ?? null,
      impact: d.impact || null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();

  if (!updated) return { error: "Projet introuvable." };

  await syncTechnologies(projectId, parseTechnologies(d.technologies));

  revalidatePath("/projets");
  revalidatePath(`/projets/${projectId}`);
  redirect(`/projets/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId();
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  revalidatePath("/projets");
  redirect("/projets");
}
