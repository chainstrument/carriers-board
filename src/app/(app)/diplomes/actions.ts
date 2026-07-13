"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { academicFormations } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const formationSchema = z.object({
  title: z.string().min(1, "L'intitulé est requis."),
  institution: z.string().optional(),
  startYear: z.coerce.number().int().min(1950).max(2100),
  endYear: z.coerce.number().int().min(1950).max(2100).optional(),
  notes: z.string().optional(),
});

function parsedData(formData: FormData) {
  return formationSchema.safeParse({
    title: formData.get("title"),
    institution: formData.get("institution") || undefined,
    startYear: formData.get("startYear"),
    endYear: formData.get("endYear") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createAcademicFormation(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  await db.insert(academicFormations).values({
    userId,
    title: d.title,
    institution: d.institution || null,
    startYear: d.startYear,
    endYear: d.endYear ?? null,
    notes: d.notes || null,
  });

  revalidatePath("/diplomes");
  redirect("/diplomes");
}

export async function updateAcademicFormation(
  formationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(academicFormations)
    .set({
      title: d.title,
      institution: d.institution || null,
      startYear: d.startYear,
      endYear: d.endYear ?? null,
      notes: d.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(academicFormations.id, formationId), eq(academicFormations.userId, userId)))
    .returning();

  if (!updated) return { error: "Diplôme introuvable." };

  revalidatePath("/diplomes");
  redirect("/diplomes");
}

export async function deleteAcademicFormation(formationId: string) {
  const userId = await requireUserId();
  await db
    .delete(academicFormations)
    .where(and(eq(academicFormations.id, formationId), eq(academicFormations.userId, userId)));

  revalidatePath("/diplomes");
  redirect("/diplomes");
}
