"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import {
  academicFormations,
  competences,
  cvAcademicFormations,
  cvCompetences,
  cvExperiences,
  cvs,
  experiences,
} from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const cvSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  title: z.string().min(1, "Le titre est requis."),
  summary: z.string().optional(),
  languages: z.string().optional(),
});

function parsedData(formData: FormData) {
  return cvSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    languages: formData.get("languages") || undefined,
  });
}

// Ne fait confiance qu'aux ids appartenant réellement à l'utilisateur —
// sans ça un id d'expérience/diplôme d'un autre compte pourrait être
// rattaché à ce CV via un formulaire trafiqué.
async function syncSelections(userId: string, cvId: string, formData: FormData) {
  const experienceIds = formData.getAll("experienceIds").map(String);
  const competenceIds = formData.getAll("competenceIds").map(String);
  const academicFormationIds = formData.getAll("academicFormationIds").map(String);

  await db.transaction(async (tx) => {
    const [validExperiences, validCompetences, validFormations] = await Promise.all([
      experienceIds.length > 0
        ? tx.query.experiences.findMany({
            where: and(inArray(experiences.id, experienceIds), eq(experiences.userId, userId)),
            columns: { id: true },
          })
        : [],
      competenceIds.length > 0
        ? tx.query.competences.findMany({
            where: inArray(competences.id, competenceIds),
            columns: { id: true },
          })
        : [],
      academicFormationIds.length > 0
        ? tx.query.academicFormations.findMany({
            where: and(inArray(academicFormations.id, academicFormationIds), eq(academicFormations.userId, userId)),
            columns: { id: true },
          })
        : [],
    ]);

    await tx.delete(cvExperiences).where(eq(cvExperiences.cvId, cvId));
    await tx.delete(cvCompetences).where(eq(cvCompetences.cvId, cvId));
    await tx.delete(cvAcademicFormations).where(eq(cvAcademicFormations.cvId, cvId));

    if (validExperiences.length > 0)
      await tx.insert(cvExperiences).values(validExperiences.map((e) => ({ cvId, experienceId: e.id })));
    if (validCompetences.length > 0)
      await tx.insert(cvCompetences).values(validCompetences.map((c) => ({ cvId, competenceId: c.id })));
    if (validFormations.length > 0)
      await tx
        .insert(cvAcademicFormations)
        .values(validFormations.map((f) => ({ cvId, academicFormationId: f.id })));
  });
}

export async function createCv(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [cv] = await db
    .insert(cvs)
    .values({
      userId,
      name: d.name,
      title: d.title,
      summary: d.summary || null,
      languages: d.languages || null,
    })
    .returning();

  await syncSelections(userId, cv.id, formData);

  revalidatePath("/cv");
  redirect(`/cv/${cv.id}`);
}

export async function updateCv(
  cvId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(cvs)
    .set({
      name: d.name,
      title: d.title,
      summary: d.summary || null,
      languages: d.languages || null,
      updatedAt: new Date(),
    })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .returning();

  if (!updated) return { error: "CV introuvable." };

  await syncSelections(userId, cvId, formData);

  revalidatePath("/cv");
  revalidatePath(`/cv/${cvId}`);
  redirect(`/cv/${cvId}`);
}

export async function deleteCv(cvId: string) {
  const userId = await requireUserId();
  await db.delete(cvs).where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));

  revalidatePath("/cv");
  redirect("/cv");
}
