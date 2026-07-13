import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { academicFormations } from "@/lib/db/schema";

export default async function AcademicFormationsPage() {
  const userId = await requireUserId();
  const items = await db.query.academicFormations.findMany({
    where: eq(academicFormations.userId, userId),
    orderBy: [desc(academicFormations.startYear)],
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Diplômes
        </h2>
        <Link
          href="/diplomes/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouveau diplôme
        </Link>
      </div>

      {items.length === 0 && (
        <p className="text-neutral-500">
          Aucun diplôme pour l&apos;instant.{" "}
          <Link href="/diplomes/new" className="underline">
            Ajoute le premier
          </Link>
          .
        </p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/diplomes/${item.id}/edit`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {item.title}
              </span>
              {item.institution && (
                <span className="ml-2 text-xs text-neutral-400">
                  {item.institution}
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-500">
              {item.endYear && item.endYear !== item.startYear
                ? `${item.startYear}-${item.endYear}`
                : item.startYear}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
