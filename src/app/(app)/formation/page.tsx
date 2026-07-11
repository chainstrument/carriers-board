import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { trainingItems } from "@/lib/db/schema";
import { typeLabel, formatMinutes, STATUS_OPTIONS } from "@/lib/formation";

export default async function TrainingPage() {
  const userId = await requireUserId();
  const items = await db.query.trainingItems.findMany({
    where: eq(trainingItems.userId, userId),
    orderBy: [desc(trainingItems.createdAt)],
  });

  const grouped = STATUS_OPTIONS.map((s) => ({
    ...s,
    items: items.filter((i) => i.status === s.value),
  }));
  const totalMinutes = items.reduce((sum, i) => sum + i.timeSpentMinutes, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Formation
        </h2>
        <Link
          href="/formation/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle formation
        </Link>
      </div>
      {items.length > 0 && (
        <p className="mb-8 text-sm text-neutral-500">
          Temps total investi : {formatMinutes(totalMinutes)}
        </p>
      )}

      {items.length === 0 && (
        <p className="mt-8 text-neutral-500">
          Aucune formation pour l&apos;instant.{" "}
          <Link href="/formation/new" className="underline">
            Ajoute la première
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
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/formation/${item.id}/edit`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                    >
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </span>
                        {item.source && (
                          <span className="ml-2 text-xs text-neutral-400">
                            {item.source}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {item.timeSpentMinutes > 0 && (
                          <span>{formatMinutes(item.timeSpentMinutes)}</span>
                        )}
                        <span>{typeLabel(item.type)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
