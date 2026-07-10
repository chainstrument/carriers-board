import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listSatisfactionEntries, averageScore } from "@/lib/satisfaction";

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

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
