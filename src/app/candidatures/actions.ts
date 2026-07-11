"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const applicationSchema = z.object({
  company: z.string().min(1, "L'entreprise est requise."),
  city: z.string().optional(),
  salary: z.coerce.number().int().min(0).optional(),
  remoteType: z.enum(["presentiel", "hybride", "full_remote", ""]).optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

function parsedData(formData: FormData) {
  return applicationSchema.safeParse({
    company: formData.get("company"),
    city: formData.get("city") || undefined,
    salary: formData.get("salary") || undefined,
    remoteType: (formData.get("remoteType") as string) || undefined,
    link: formData.get("link") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createApplication(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  await db.insert(jobApplications).values({
    userId,
    company: d.company,
    city: d.city || null,
    salary: d.salary ?? null,
    remoteType: d.remoteType || null,
    link: d.link || null,
    notes: d.notes || null,
  });

  revalidatePath("/candidatures");
  redirect("/candidatures");
}

export async function updateApplication(
  applicationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(jobApplications)
    .set({
      company: d.company,
      city: d.city || null,
      salary: d.salary ?? null,
      remoteType: d.remoteType || null,
      link: d.link || null,
      notes: d.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .returning();

  if (!updated) return { error: "Candidature introuvable." };

  revalidatePath("/candidatures");
  redirect("/candidatures");
}

export async function deleteApplication(applicationId: string) {
  const userId = await requireUserId();
  await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)));

  revalidatePath("/candidatures");
  redirect("/candidatures");
}
