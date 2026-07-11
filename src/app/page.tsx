import Link from "next/link";
import { auth } from "@/auth";
import { requireUserId } from "@/lib/auth-helpers";
import {
  getCurrentExperience,
  getRecentSatisfaction,
  getRecentJournalEntries,
  getTopCompetences,
  getActiveGoals,
} from "@/lib/dashboard";
import { computeNetEstimate, computePackageTotal, formatEuros, getNetEstimateRatio } from "@/lib/package";
import { averageScore } from "@/lib/satisfaction";
import { computeRiskLevel, getStaleKeyCompetencesCount } from "@/lib/risk";
import { priorityLabel } from "@/lib/goals";
import { durationLabel } from "./experiences/date-range";
import { WidgetCard } from "@/components/widget-card";
import { LevelDots } from "@/components/level-dots";
import { logout } from "./logout/actions";

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

const RISK_STYLES = {
  faible: "text-green-600 dark:text-green-500",
  modere: "text-amber-600 dark:text-amber-500",
  eleve: "text-red-600 dark:text-red-500",
};

const RISK_LABELS = { faible: "Faible", modere: "Modéré", eleve: "Élevé" };

export default async function Home() {
  const session = await auth();
  const userId = await requireUserId();
  const [
    currentExperience,
    netEstimateRatio,
    recentSatisfaction,
    staleKeyCompetencesCount,
    recentJournalEntries,
    topCompetences,
    activeGoals,
  ] = await Promise.all([
    getCurrentExperience(userId),
    getNetEstimateRatio(userId),
    getRecentSatisfaction(userId),
    getStaleKeyCompetencesCount(),
    getRecentJournalEntries(userId),
    getTopCompetences(),
    getActiveGoals(userId),
  ]);
  const [latestSatisfaction, previousSatisfaction] = recentSatisfaction;
  const risk = computeRiskLevel({
    currentExperience: currentExperience ?? null,
    recentSatisfaction,
    staleKeyCompetencesCount,
  });

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

          <WidgetCard title="Satisfaction" href="/satisfaction">
            {latestSatisfaction ? (
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {averageScore(latestSatisfaction).toFixed(1)}/10
                </p>
                <p className="text-sm capitalize text-neutral-500">
                  {monthFormatter.format(new Date(latestSatisfaction.month))}
                </p>
                {previousSatisfaction && (
                  <p className="mt-2 text-xs text-neutral-400">
                    {averageScore(latestSatisfaction) >= averageScore(previousSatisfaction)
                      ? "↗ en hausse"
                      : "↘ en baisse"}{" "}
                    vs mois précédent
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Aucune évaluation pour l&apos;instant.</p>
            )}
          </WidgetCard>

          <WidgetCard title="Niveau de risque">
            <p className={`text-lg font-semibold ${RISK_STYLES[risk.level]}`}>{RISK_LABELS[risk.level]}</p>
            {risk.reasons.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-neutral-500">
                {risk.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">Rien à signaler pour l&apos;instant.</p>
            )}
          </WidgetCard>

          <WidgetCard title="Dernières notes de journal" href="/journal">
            {recentJournalEntries.length > 0 ? (
              <ul className="space-y-2">
                {recentJournalEntries.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="line-clamp-1 text-neutral-700 dark:text-neutral-300">{entry.content}</p>
                    <p className="text-xs text-neutral-400">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
                        new Date(entry.entryDate),
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Aucune note pour l&apos;instant.</p>
            )}
          </WidgetCard>

          <WidgetCard title="Objectifs en cours" href="/objectifs">
            {activeGoals.length > 0 ? (
              <ul className="space-y-2">
                {activeGoals.map((goal) => (
                  <li key={goal.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">{goal.title}</span>
                      <span className="text-xs text-neutral-400">{priorityLabel(goal.priority)}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Aucun objectif en cours.</p>
            )}
          </WidgetCard>

          <WidgetCard title="Compétences principales" href="/competences">
            {topCompetences.length > 0 ? (
              <ul className="space-y-2">
                {topCompetences.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">{c.name}</span>
                    <LevelDots value={c.level} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Aucune compétence notée pour l&apos;instant.</p>
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
          <Link
            href="/objectifs"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mes objectifs →
          </Link>
          <Link
            href="/projets"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mes projets →
          </Link>
          <Link
            href="/formation"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir ma formation →
          </Link>
          <Link
            href="/candidatures"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mes candidatures →
          </Link>
        </div>
      </main>
    </div>
  );
}
