"use server";

import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type ActionState = { error?: string; success?: boolean } | undefined;

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "8 caractères minimum."),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const user = await db.query.users.findFirst({
    where: and(eq(users.resetToken, parsed.data.token), gt(users.resetTokenExpiresAt, new Date())),
  });
  if (!user) {
    return { error: "Lien invalide ou expiré. Recommence la procédure." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db
    .update(users)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: true };
}
