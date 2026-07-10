import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listExperiencesWithTech } from "@/lib/experiences";
import { formatDateRange, durationLabel } from "./date-range";

export default async function ExperiencesPage() {
  const userId = await requireUserId();
  const experiences = await listExperiencesWithTech(userId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/experiences/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle expérience
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Parcours professionnel
        </h2>

        {experiences.length === 0 && (
          <p className="text-neutral-500">
            Aucune expérience enregistrée pour l&apos;instant.{" "}
            <Link href="/experiences/new" className="underline">
              Ajoute la première
            </Link>
            .
          </p>
        )}

        <ol className="relative space-y-8 border-l border-neutral-200 pl-6 dark:border-neutral-800">
          {experiences.map((exp) => (
            <li key={exp.id} className="relative">
              <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full bg-neutral-400 dark:bg-neutral-600" />
              <Link href={`/experiences/${exp.id}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {exp.title} — {exp.company}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {formatDateRange(exp.startDate, exp.endDate)} · {durationLabel(exp.startDate, exp.endDate)}
                  </span>
                </div>
                {exp.location && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {exp.location}
                    {exp.remoteType ? ` · ${exp.remoteType.replace("_", " ")}` : ""}
                  </p>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
