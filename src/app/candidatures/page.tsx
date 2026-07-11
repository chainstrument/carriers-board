import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/db/schema";
import { STATUS_OPTIONS } from "@/lib/job-board";
import { moveStatus } from "./actions";

export default async function JobApplicationsPage() {
  const userId = await requireUserId();
  const applications = await db.query.jobApplications.findMany({
    where: eq(jobApplications.userId, userId),
    orderBy: [desc(jobApplications.createdAt)],
  });

  const columns = STATUS_OPTIONS.map((s, index) => ({
    ...s,
    index,
    items: applications.filter((a) => a.status === s.value),
  }));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/candidatures/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle entreprise
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Job board personnel
        </h2>

        {applications.length === 0 && (
          <p className="text-neutral-500">
            Aucune entreprise ciblée pour l&apos;instant.{" "}
            <Link href="/candidatures/new" className="underline">
              Ajoute la première
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-6">
          {columns.map((column) => (
            <div key={column.value} className="min-w-[220px]">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {column.label} ({column.items.length})
              </h3>
              <div className="space-y-2">
                {column.items.map((app) => {
                  const previous = columns[column.index - 1];
                  const next = columns[column.index + 1];
                  return (
                    <div
                      key={app.id}
                      className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <Link href={`/candidatures/${app.id}/edit`} className="block hover:underline">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{app.company}</span>
                        {app.city && <p className="text-xs text-neutral-500">{app.city}</p>}
                      </Link>
                      <div className="mt-2 flex justify-between">
                        <form action={previous ? moveStatus.bind(null, app.id, previous.value) : undefined}>
                          <button
                            type="submit"
                            disabled={!previous}
                            className="text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-0 dark:hover:text-neutral-200"
                          >
                            ← {previous?.label}
                          </button>
                        </form>
                        <form action={next ? moveStatus.bind(null, app.id, next.value) : undefined}>
                          <button
                            type="submit"
                            disabled={!next}
                            className="text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-0 dark:hover:text-neutral-200"
                          >
                            {next?.label} →
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
