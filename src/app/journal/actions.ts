"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { journalEntries, journalEntryTags, tags } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const entrySchema = z.object({
  entryDate: z.string().min(1, "La date est requise."),
  content: z.string().min(1, "Le contenu est requis."),
  mood: z.coerce.number().int().min(1).max(5).optional(),
  experienceId: z.string().uuid().optional(),
  tags: z.string().optional(),
});

function parseTagNames(raw: string | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

async function syncTags(journalEntryId: string, names: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(journalEntryTags).where(eq(journalEntryTags.journalEntryId, journalEntryId));
    if (names.length === 0) return;

    const existing = await tx.query.tags.findMany({ where: inArray(tags.name, names) });
    const existingNames = new Set(existing.map((t) => t.name));
    const toCreate = names.filter((n) => !existingNames.has(n));

    const created = toCreate.length
      ? await tx.insert(tags).values(toCreate.map((name) => ({ name }))).returning()
      : [];

    const allTags = [...existing, ...created];
    await tx.insert(journalEntryTags).values(allTags.map((t) => ({ journalEntryId, tagId: t.id })));
  });
}

function parsedData(formData: FormData) {
  return entrySchema.safeParse({
    entryDate: formData.get("entryDate"),
    content: formData.get("content"),
    mood: formData.get("mood") || undefined,
    experienceId: formData.get("experienceId") || undefined,
    tags: formData.get("tags") || undefined,
  });
}

export async function createEntry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const [entry] = await db
    .insert(journalEntries)
    .values({
      userId,
      entryDate: parsed.data.entryDate,
      content: parsed.data.content,
      mood: parsed.data.mood ?? null,
      experienceId: parsed.data.experienceId ?? null,
    })
    .returning();

  await syncTags(entry.id, parseTagNames(parsed.data.tags));

  revalidatePath("/journal");
  redirect("/journal");
}

export async function updateEntry(
  entryId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const [updated] = await db
    .update(journalEntries)
    .set({
      entryDate: parsed.data.entryDate,
      content: parsed.data.content,
      mood: parsed.data.mood ?? null,
      experienceId: parsed.data.experienceId ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
    .returning();

  if (!updated) return { error: "Note introuvable." };

  await syncTags(entryId, parseTagNames(parsed.data.tags));

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
