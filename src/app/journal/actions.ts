"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const entrySchema = z.object({
  entryDate: z.string().min(1, "La date est requise."),
  content: z.string().min(1, "Le contenu est requis."),
});

export async function createEntry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = entrySchema.safeParse({
    entryDate: formData.get("entryDate"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  await db.insert(journalEntries).values({
    userId,
    entryDate: parsed.data.entryDate,
    content: parsed.data.content,
  });

  revalidatePath("/journal");
  redirect("/journal");
}

export async function updateEntry(
  entryId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = entrySchema.safeParse({
    entryDate: formData.get("entryDate"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  await db
    .update(journalEntries)
    .set({ entryDate: parsed.data.entryDate, content: parsed.data.content, updatedAt: new Date() })
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));

  revalidatePath("/journal");
  redirect("/journal");
}

export async function deleteEntry(entryId: string) {
  const userId = await requireUserId();
  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));

  revalidatePath("/journal");
  redirect("/journal");
}
