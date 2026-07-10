"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { competences } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const scaleSchema = z.coerce.number().int().min(1).max(5).optional();

const competenceSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  category: z.string().optional(),
  level: scaleSchema,
  confidence: scaleSchema,
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  wantsToImprove: z.string().optional(),
  manualLastUsedAt: z.string().optional(),
});

function parsedData(formData: FormData) {
  return competenceSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    level: formData.get("level") || undefined,
    confidence: formData.get("confidence") || undefined,
    yearsOfExperience: formData.get("yearsOfExperience") || undefined,
    wantsToImprove: formData.get("wantsToImprove") || undefined,
    manualLastUsedAt: formData.get("manualLastUsedAt") || undefined,
  });
}

export async function createCompetence(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const existing = await db.query.competences.findFirst({ where: eq(competences.name, d.name) });
  if (existing) return { error: "Cette compétence existe déjà." };

  await db.insert(competences).values({
    name: d.name,
    category: d.category || null,
    level: d.level ?? null,
    confidence: d.confidence ?? null,
    yearsOfExperience: d.yearsOfExperience ?? null,
    wantsToImprove: d.wantsToImprove === "on",
    manualLastUsedAt: d.manualLastUsedAt || null,
  });

  revalidatePath("/competences");
  redirect("/competences");
}

export async function updateCompetence(
  competenceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  await db
    .update(competences)
    .set({
      name: d.name,
      category: d.category || null,
      level: d.level ?? null,
      confidence: d.confidence ?? null,
      yearsOfExperience: d.yearsOfExperience ?? null,
      wantsToImprove: d.wantsToImprove === "on",
      manualLastUsedAt: d.manualLastUsedAt || null,
    })
    .where(eq(competences.id, competenceId));

  revalidatePath("/competences");
  redirect("/competences");
}

export async function deleteCompetence(competenceId: string) {
  await requireUserId();
  await db.delete(competences).where(eq(competences.id, competenceId));
  revalidatePath("/competences");
  redirect("/competences");
}
