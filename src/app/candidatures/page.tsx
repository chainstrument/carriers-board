import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/db/schema";
import { statusLabel } from "@/lib/job-board";

export default async function JobApplicationsPage() {
  const userId = await requireUserId();
  const applications = await db.query.jobApplications.findMany({
    where: eq(jobApplications.userId, userId),
    orderBy: [desc(jobApplications.createdAt)],
  });

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

      <main className="mx-auto max-w-3xl px-6 py-16">
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

        <div className="space-y-2">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/candidatures/${app.id}/edit`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{app.company}</span>
                {app.city && <span className="ml-2 text-sm text-neutral-500">{app.city}</span>}
              </div>
              <span className="text-xs text-neutral-500">{statusLabel(app.status)}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
