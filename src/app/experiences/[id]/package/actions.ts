"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiences, salaryPackages } from "@/lib/db/schema";

export type ActionState = { error?: string } | undefined;

const packageSchema = z.object({
  baseSalary: z.coerce.number().int().min(0, "Le salaire fixe doit être positif."),
  bonus: z.coerce.number().int().min(0).optional(),
  profitSharing: z.coerce.number().int().min(0).optional(),
  profitIncentive: z.coerce.number().int().min(0).optional(),
  mealVouchersAnnual: z.coerce.number().int().min(0).optional(),
  healthInsuranceAnnual: z.coerce.number().int().min(0).optional(),
  transportAnnual: z.coerce.number().int().min(0).optional(),
  benefitsInKindAnnual: z.coerce.number().int().min(0).optional(),
  rttDays: z.coerce.number().int().min(0).optional(),
});

export async function upsertPackage(
  experienceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const experience = await db.query.experiences.findFirst({
    where: and(eq(experiences.id, experienceId), eq(experiences.userId, userId)),
    columns: { id: true },
  });
  if (!experience) return { error: "Expérience introuvable." };

  const parsed = packageSchema.safeParse({
    baseSalary: formData.get("baseSalary"),
    bonus: formData.get("bonus"),
    profitSharing: formData.get("profitSharing"),
    profitIncentive: formData.get("profitIncentive"),
    mealVouchersAnnual: formData.get("mealVouchersAnnual"),
    healthInsuranceAnnual: formData.get("healthInsuranceAnnual"),
    transportAnnual: formData.get("transportAnnual"),
    benefitsInKindAnnual: formData.get("benefitsInKindAnnual"),
    rttDays: formData.get("rttDays"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  await db
    .insert(salaryPackages)
    .values({
      experienceId,
      baseSalary: d.baseSalary,
      bonus: d.bonus ?? 0,
      profitSharing: d.profitSharing ?? 0,
      profitIncentive: d.profitIncentive ?? 0,
      mealVouchersAnnual: d.mealVouchersAnnual ?? 0,
      healthInsuranceAnnual: d.healthInsuranceAnnual ?? 0,
      transportAnnual: d.transportAnnual ?? 0,
      benefitsInKindAnnual: d.benefitsInKindAnnual ?? 0,
      rttDays: d.rttDays ?? 0,
    })
    .onConflictDoUpdate({
      target: salaryPackages.experienceId,
      set: {
        baseSalary: d.baseSalary,
        bonus: d.bonus ?? 0,
        profitSharing: d.profitSharing ?? 0,
        profitIncentive: d.profitIncentive ?? 0,
        mealVouchersAnnual: d.mealVouchersAnnual ?? 0,
        healthInsuranceAnnual: d.healthInsuranceAnnual ?? 0,
        transportAnnual: d.transportAnnual ?? 0,
        benefitsInKindAnnual: d.benefitsInKindAnnual ?? 0,
        rttDays: d.rttDays ?? 0,
        updatedAt: new Date(),
      },
    });

  revalidatePath(`/experiences/${experienceId}`);
  revalidatePath("/package");
  redirect(`/experiences/${experienceId}`);
}
