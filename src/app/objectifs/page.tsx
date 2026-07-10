import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { priorityLabel, statusLabel, STATUS_OPTIONS } from "@/lib/goals";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default async function GoalsPage() {
  const userId = await requireUserId();
  const allGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    orderBy: [desc(goals.priority)],
  });

  const grouped = STATUS_OPTIONS.map((s) => ({
    ...s,
    items: allGoals.filter((g) => g.status === s.value),
  }));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/objectifs/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvel objectif
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Objectifs
        </h2>

        {allGoals.length === 0 && (
          <p className="text-neutral-500">
            Aucun objectif pour l&apos;instant.{" "}
            <Link href="/objectifs/new" className="underline">
              Ajoute le premier
            </Link>
            .
          </p>
        )}

        <div className="space-y-8">
          {grouped.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.value}>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
                    {group.label} ({group.items.length})
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((goal) => (
                      <Link
                        key={goal.id}
                        href={`/objectifs/${goal.id}/edit`}
                        className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {goal.title}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_STYLES[goal.priority]}`}>
                              {priorityLabel(goal.priority)}
                            </span>
                          </div>
                          {goal.deadline && (
                            <span className="text-xs text-neutral-500">{dateFormatter.format(new Date(goal.deadline))}</span>
                          )}
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">{goal.progress}% — {statusLabel(goal.status)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </main>
    </div>
  );
}
