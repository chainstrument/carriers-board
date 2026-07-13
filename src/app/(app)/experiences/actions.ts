"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { competences, experienceCompetences, experiences } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const experienceSchema = z
  .object({
    company: z.string().min(1, "L'entreprise est requise."),
    title: z.string().min(1, "Le poste est requis."),
    location: z.string().optional(),
    remoteDaysPerWeek: z.coerce.number().int().min(0).max(7).optional(),
    startDate: z.string().min(1, "La date de début est requise."),
    isCurrent: z.string().optional(),
    endDate: z.string().optional(),
    manager: z.string().optional(),
    missions: z.string().optional(),
    positives: z.string().optional(),
    negatives: z.string().optional(),
    departureReason: z.string().optional(),
    learnings: z.string().optional(),
    technologies: z.string().optional(),
  })
  .refine((data) => data.isCurrent === "on" || !!data.endDate, {
    message: "La date de fin est requise (ou coche 'poste actuel').",
    path: ["endDate"],
  });

function parseTechnologies(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

async function syncTechnologies(experienceId: string, names: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(experienceCompetences).where(eq(experienceCompetences.experienceId, experienceId));
    if (names.length === 0) return;

    const existing = await tx.query.competences.findMany({
      where: inArray(competences.name, names),
    });
    const existingNames = new Set(existing.map((c) => c.name));
    const toCreate = names.filter((n) => !existingNames.has(n));

    const created = toCreate.length
      ? await tx.insert(competences).values(toCreate.map((name) => ({ name }))).returning()
      : [];

    const allCompetences = [...existing, ...created];
    await tx.insert(experienceCompetences).values(
      allCompetences.map((c) => ({ experienceId, competenceId: c.id })),
    );
  });
}

function parsedData(formData: FormData) {
  return experienceSchema.safeParse({
    company: formData.get("company"),
    title: formData.get("title"),
    location: formData.get("location") || undefined,
    remoteDaysPerWeek: formData.get("remoteDaysPerWeek") || undefined,
    startDate: formData.get("startDate"),
    isCurrent: formData.get("isCurrent") || undefined,
    endDate: formData.get("endDate") || undefined,
    manager: formData.get("manager") || undefined,
    missions: formData.get("missions") || undefined,
    positives: formData.get("positives") || undefined,
    negatives: formData.get("negatives") || undefined,
    departureReason: formData.get("departureReason") || undefined,
    learnings: formData.get("learnings") || undefined,
    technologies: formData.get("technologies") || undefined,
  });
}

export async function createExperience(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  const [experience] = await db
    .insert(experiences)
    .values({
      userId,
      company: d.company,
      title: d.title,
      location: d.location || null,
      remoteDaysPerWeek: d.remoteDaysPerWeek ?? null,
      startDate: d.startDate,
      endDate: d.isCurrent === "on" ? null : d.endDate || null,
      manager: d.manager || null,
      missions: d.missions || null,
      positives: d.positives || null,
      negatives: d.negatives || null,
      departureReason: d.departureReason || null,
      learnings: d.learnings || null,
    })
    .returning();

  await syncTechnologies(experience.id, parseTechnologies(d.technologies));

  revalidatePath("/experiences");
  redirect(`/experiences/${experience.id}`);
}

export async function updateExperience(
  experienceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  const [updated] = await db
    .update(experiences)
    .set({
      company: d.company,
      title: d.title,
      location: d.location || null,
      remoteDaysPerWeek: d.remoteDaysPerWeek ?? null,
      startDate: d.startDate,
      endDate: d.isCurrent === "on" ? null : d.endDate || null,
      manager: d.manager || null,
      missions: d.missions || null,
      positives: d.positives || null,
      negatives: d.negatives || null,
      departureReason: d.departureReason || null,
      learnings: d.learnings || null,
      updatedAt: new Date(),
    })
    .where(and(eq(experiences.id, experienceId), eq(experiences.userId, userId)))
    .returning();

  if (!updated) return { error: "Expérience introuvable." };

  await syncTechnologies(experienceId, parseTechnologies(d.technologies));

  revalidatePath("/experiences");
  revalidatePath(`/experiences/${experienceId}`);
  redirect(`/experiences/${experienceId}`);
}

export async function deleteExperience(experienceId: string) {
  const userId = await requireUserId();
  await db
    .delete(experiences)
    .where(and(eq(experiences.id, experienceId), eq(experiences.userId, userId)));

  revalidatePath("/experiences");
  redirect("/experiences");
}
