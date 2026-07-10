import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { getCurrentTheme } from "@/lib/theme";
import { getNetEstimateRatio } from "@/lib/package";
import { ThemeForm } from "./theme-form";
import { NetEstimateForm } from "./net-estimate-form";

export default async function SettingsPage() {
  const theme = await getCurrentTheme();
  const userId = await requireUserId();
  const netEstimateRatio = await getNetEstimateRatio(userId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Paramètres
        </h2>
        <div className="space-y-6">
          <ThemeForm current={theme} />
          <NetEstimateForm current={netEstimateRatio} />
        </div>
      </main>
    </div>
  );
}
