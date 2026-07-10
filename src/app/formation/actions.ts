"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { trainingItems } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const itemSchema = z.object({
  type: z.enum(["book", "course", "video", "article", "watch"]),
  title: z.string().min(1, "Le titre est requis."),
  source: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  notes: z.string().optional(),
});

function parsedData(formData: FormData) {
  return itemSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    source: formData.get("source") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  await db.insert(trainingItems).values({
    userId,
    type: d.type,
    title: d.title,
    source: d.source || null,
    status: d.status,
    notes: d.notes || null,
  });

  revalidatePath("/formation");
  redirect("/formation");
}

export async function updateItem(
  itemId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(trainingItems)
    .set({
      type: d.type,
      title: d.title,
      source: d.source || null,
      status: d.status,
      notes: d.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(trainingItems.id, itemId), eq(trainingItems.userId, userId)))
    .returning();

  if (!updated) return { error: "Formation introuvable." };

  revalidatePath("/formation");
  redirect("/formation");
}

export async function deleteItem(itemId: string) {
  const userId = await requireUserId();
  await db.delete(trainingItems).where(and(eq(trainingItems.id, itemId), eq(trainingItems.userId, userId)));

  revalidatePath("/formation");
  redirect("/formation");
}
