"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { satisfactionEntries } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const scale = z.coerce.number().int().min(1).max(10);

const entrySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Mois requis."),
  stress: scale,
  salary: scale,
  team: scale,
  management: scale,
  remoteWork: scale,
  workplace: scale,
  workLifeBalance: scale,
  technicalInterest: scale,
  autonomy: scale,
  companyVision: scale,
  notes: z.string().optional(),
});

function parsedData(formData: FormData) {
  return entrySchema.safeParse({
    month: formData.get("month"),
    stress: formData.get("stress"),
    salary: formData.get("salary"),
    team: formData.get("team"),
    management: formData.get("management"),
    remoteWork: formData.get("remoteWork"),
    workplace: formData.get("workplace"),
    workLifeBalance: formData.get("workLifeBalance"),
    technicalInterest: formData.get("technicalInterest"),
    autonomy: formData.get("autonomy"),
    companyVision: formData.get("companyVision"),
    notes: formData.get("notes") || undefined,
  });
}

export async function upsertEntry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;
  const month = `${d.month}-01`;

  const values = {
    userId,
    month,
    stress: d.stress,
    salary: d.salary,
    team: d.team,
    management: d.management,
    remoteWork: d.remoteWork,
    workplace: d.workplace,
    workLifeBalance: d.workLifeBalance,
    technicalInterest: d.technicalInterest,
    autonomy: d.autonomy,
    companyVision: d.companyVision,
    notes: d.notes || null,
  };

  await db
    .insert(satisfactionEntries)
    .values(values)
    .onConflictDoUpdate({
      target: [satisfactionEntries.userId, satisfactionEntries.month],
      set: { ...values, updatedAt: new Date() },
    });

  revalidatePath("/satisfaction");
  redirect("/satisfaction");
}

export async function deleteEntry(entryId: string) {
  const userId = await requireUserId();
  await db
    .delete(satisfactionEntries)
    .where(and(eq(satisfactionEntries.id, entryId), eq(satisfactionEntries.userId, userId)));

  revalidatePath("/satisfaction");
  redirect("/satisfaction");
}
