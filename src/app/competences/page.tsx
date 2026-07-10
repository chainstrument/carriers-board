import Link from "next/link";
import { listCompetencesWithUsage } from "@/lib/competences";
import { LevelDots } from "@/components/level-dots";

export default async function CompetencesPage() {
  const competences = await listCompetencesWithUsage();

  const grouped = new Map<string, typeof competences>();
  for (const c of competences) {
    const key = c.category ?? "Sans catégorie";
    grouped.set(key, [...(grouped.get(key) ?? []), c]);
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/competences/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle compétence
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Compétences
        </h2>

        {competences.length === 0 && (
          <p className="text-neutral-500">
            Aucune compétence pour l&apos;instant. Elles se créent aussi automatiquement en
            listant les technologies d&apos;une expérience.
          </p>
        )}

        <div className="space-y-8">
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <Link
                    key={c.id}
                    href={`/competences/${c.id}/edit`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{c.name}</span>
                      {c.wantsToImprove && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          à progresser
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      {c.yearsOfExperience !== null && <span>{c.yearsOfExperience} an(s)</span>}
                      <span>Niveau <LevelDots value={c.level} /></span>
                      {c.lastUsed.date && (
                        <span>
                          Utilisée {c.lastUsed.source === "experience" ? "jusqu'en" : "en"} {c.lastUsed.date.slice(0, 7)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
