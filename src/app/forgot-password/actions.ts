"use server";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type ActionState = { message: string } | undefined;

const schema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  const genericMessage = "Si un compte existe avec cet email, un lien de réinitialisation a été généré.";
  if (!parsed.success) return { message: genericMessage };

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) })
      .where(eq(users.id, user.id));

    // Aucun service d'email configuré pour l'instant : le lien est loggé
    // côté serveur. A brancher sur un vrai envoi (ex. Resend) plus tard.
    console.log(`[reset-password] lien pour ${user.email}: /reset-password/${token}`);
  }

  return { message: genericMessage };
}
