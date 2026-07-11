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
    <div className="mx-auto max-w-xl px-6 py-16">
      <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Paramètres
      </h2>
      <div className="space-y-6">
        <ThemeForm current={theme} />
        <NetEstimateForm current={netEstimateRatio} />
      </div>
    </div>
  );
}
