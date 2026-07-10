import Link from "next/link";
import { auth } from "@/auth";
import { requireUserId } from "@/lib/auth-helpers";
import { getCurrentExperience } from "@/lib/dashboard";
import { computeNetEstimate, computePackageTotal, formatEuros, getNetEstimateRatio } from "@/lib/package";
import { durationLabel } from "./experiences/date-range";
import { WidgetCard } from "@/components/widget-card";
import { logout } from "./logout/actions";

export default async function Home() {
  const session = await auth();
  const userId = await requireUserId();
  const [currentExperience, netEstimateRatio] = await Promise.all([
    getCurrentExperience(userId),
    getNetEstimateRatio(userId),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/profile" className="text-neutral-600 hover:underline dark:text-neutral-400">
            {session?.user?.name ?? session?.user?.email}
          </Link>
          <Link href="/settings" className="text-neutral-600 hover:underline dark:text-neutral-400">
            Paramètres
          </Link>
          <form action={logout}>
            <button type="submit" className="text-neutral-600 hover:underline dark:text-neutral-400">
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WidgetCard title="Poste actuel" href={currentExperience ? `/experiences/${currentExperience.id}` : "/experiences/new"}>
            {currentExperience ? (
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {currentExperience.title}
                </p>
                <p className="text-sm text-neutral-500">{currentExperience.company}</p>
                <p className="mt-2 text-xs text-neutral-400">
                  Ancienneté : {durationLabel(currentExperience.startDate, currentExperience.endDate)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Aucun poste actuel renseigné.</p>
            )}
          </WidgetCard>

          <WidgetCard title="Package" href={currentExperience ? `/experiences/${currentExperience.id}/package` : undefined}>
            {currentExperience?.salaryPackage ? (
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatEuros(computePackageTotal(currentExperience.salaryPackage))} / an
                </p>
                <p className="text-sm text-neutral-500">
                  ≈ {formatEuros(computeNetEstimate(currentExperience.salaryPackage, netEstimateRatio))} net estimé
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Package pas encore configuré.</p>
            )}
          </WidgetCard>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/experiences"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mon parcours professionnel →
          </Link>
          <Link
            href="/competences"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mes compétences →
          </Link>
          <Link
            href="/journal"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mon journal →
          </Link>
          <Link
            href="/satisfaction"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir ma satisfaction →
          </Link>
        </div>
      </main>
    </div>
  );
}
