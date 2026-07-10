"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const goalSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "done", "abandoned"]),
  progress: z.coerce.number().int().min(0).max(100),
});

function parsedData(formData: FormData) {
  return goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    deadline: formData.get("deadline") || undefined,
    priority: formData.get("priority"),
    status: formData.get("status"),
    progress: formData.get("progress"),
  });
}

export async function createGoal(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  await db.insert(goals).values({
    userId,
    title: d.title,
    description: d.description || null,
    deadline: d.deadline || null,
    priority: d.priority,
    status: d.status,
    progress: d.progress,
  });

  revalidatePath("/objectifs");
  revalidatePath("/");
  redirect("/objectifs");
}

export async function updateGoal(
  goalId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = parsedData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;

  const [updated] = await db
    .update(goals)
    .set({
      title: d.title,
      description: d.description || null,
      deadline: d.deadline || null,
      priority: d.priority,
      status: d.status,
      progress: d.progress,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  if (!updated) return { error: "Objectif introuvable." };

  revalidatePath("/objectifs");
  revalidatePath("/");
  redirect("/objectifs");
}

export async function deleteGoal(goalId: string) {
  const userId = await requireUserId();
  await db.delete(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  revalidatePath("/objectifs");
  revalidatePath("/");
  redirect("/objectifs");
}
