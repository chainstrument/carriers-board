import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listSatisfactionEntries, averageScore, CRITERIA } from "@/lib/satisfaction";
import { Sparkline } from "@/components/sparkline";

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const shortMonthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" });

export default async function SatisfactionPage() {
  const userId = await requireUserId();
  const entries = await listSatisfactionEntries(userId);
  const sorted = [...entries].reverse(); // most recent first for the list

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/satisfaction/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle évaluation
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Satisfaction
        </h2>

        {entries.length === 0 && (
          <p className="text-neutral-500">
            Aucune évaluation pour l&apos;instant.{" "}
            <Link href="/satisfaction/new" className="underline">
              Note ton premier mois
            </Link>
            .
          </p>
        )}

        {entries.length >= 2 && (
          <section className="mb-12 space-y-8">
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-500">
                Évolution de la moyenne globale
              </h3>
              <Sparkline values={entries.map((e) => averageScore(e))} width={480} height={80} />
              <div className="mt-1 flex justify-between text-xs text-neutral-400">
                <span>{shortMonthFormatter.format(new Date(entries[0].month))}</span>
                <span>{shortMonthFormatter.format(new Date(entries[entries.length - 1].month))}</span>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-neutral-500">Par critère</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {CRITERIA.map((c) => (
                  <div key={c.key} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                    <p className="mb-1 text-xs text-neutral-500">{c.label}</p>
                    <Sparkline values={entries.map((e) => e[c.key] as number)} width={220} height={36} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <ul className="space-y-3">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/satisfaction/${entry.id}/edit`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <span className="font-medium capitalize text-neutral-900 dark:text-neutral-100">
                  {monthFormatter.format(new Date(entry.month))}
                </span>
                <span className="text-sm text-neutral-500">
                  Moyenne {averageScore(entry).toFixed(1)}/10
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
