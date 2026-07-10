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
