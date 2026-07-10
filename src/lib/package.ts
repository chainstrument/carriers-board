import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type SalaryPackage } from "@/lib/db/schema";

export async function getNetEstimateRatio(userId: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { netEstimateRatio: true },
  });
  return user?.netEstimateRatio ?? 0.78;
}

export function computePackageTotal(pkg: SalaryPackage): number {
  return (
    pkg.baseSalary +
    pkg.bonus +
    pkg.profitSharing +
    pkg.profitIncentive +
    pkg.mealVouchersAnnual +
    pkg.healthInsuranceAnnual +
    pkg.transportAnnual +
    pkg.benefitsInKindAnnual
  );
}

export function computeNetEstimate(pkg: SalaryPackage, netEstimateRatio: number): number {
  return Math.round(computePackageTotal(pkg) * netEstimateRatio);
}

export function formatEuros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
