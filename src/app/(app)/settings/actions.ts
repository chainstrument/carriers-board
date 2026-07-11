"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type ActionState = { error?: string; success?: string } | undefined;

const themeSchema = z.enum(["light", "dark", "dev"]);

export async function updateTheme(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const parsed = themeSchema.safeParse(formData.get("theme"));
  if (!parsed.success) return { error: "Thème invalide." };

  await db
    .update(users)
    .set({ theme: parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/", "layout");
  return { success: "Thème mis à jour." };
}

const netEstimateRatioSchema = z.coerce.number().min(0.1).max(1);

export async function updateNetEstimateRatio(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non authentifié." };

  const parsed = netEstimateRatioSchema.safeParse(formData.get("netEstimateRatio"));
  if (!parsed.success) return { error: "Coefficient invalide (entre 0.1 et 1)." };

  await db
    .update(users)
    .set({ netEstimateRatio: parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/experiences");
  revalidatePath("/package");
  return { success: "Coefficient mis à jour." };
}
