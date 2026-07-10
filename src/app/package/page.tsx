import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listExperiencesWithPackage } from "@/lib/experiences";
import { computeDeltaPercent, computePackageTotal, formatEuros, getNetEstimateRatio } from "@/lib/package";
import { formatDateRange } from "../experiences/date-range";

export default async function PackageHistoryPage() {
  const userId = await requireUserId();
  const [experiences, netEstimateRatio] = await Promise.all([
    listExperiencesWithPackage(userId),
    getNetEstimateRatio(userId),
  ]);

  const withPackage = experiences.filter((e) => e.salaryPackage);
  const maxTotal = Math.max(1, ...withPackage.map((e) => computePackageTotal(e.salaryPackage!)));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/experiences" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Parcours
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Évolution du package
        </h2>
        <p className="mb-8 text-sm text-neutral-500">
          Historique chronologique du package annuel, poste par poste.
        </p>

        {withPackage.length === 0 && (
          <p className="text-neutral-500">
            Aucun package configuré pour l&apos;instant. Ajoute un package depuis une fiche
            expérience.
          </p>
        )}

        <ul className="space-y-4">
          {withPackage.map((exp) => {
            const total = computePackageTotal(exp.salaryPackage!);
            const widthPct = Math.max(4, Math.round((total / maxTotal) * 100));
            return (
              <li key={exp.id}>
                <Link
                  href={`/experiences/${exp.id}`}
                  className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                >
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {exp.title} — {exp.company}
                    </span>
                    <span className="text-neutral-500">{formatDateRange(exp.startDate, exp.endDate)}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-full rounded-full bg-neutral-700 dark:bg-neutral-300" style={{ width: `${widthPct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-neutral-500">
                    <span>{formatEuros(total)} / an</span>
                    <span>≈ {formatEuros(Math.round(total * netEstimateRatio))} net estimé</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {withPackage.length > 1 && (
          <section className="mt-12">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Comparaison entre postes
            </h3>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Poste</th>
                    <th className="px-4 py-2 font-medium">Package annuel</th>
                    <th className="px-4 py-2 font-medium">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {withPackage.map((exp, i) => {
                    const total = computePackageTotal(exp.salaryPackage!);
                    const previousTotal =
                      i > 0 ? computePackageTotal(withPackage[i - 1].salaryPackage!) : null;
                    const deltaPercent = computeDeltaPercent(total, previousTotal);
                    return (
                      <tr key={exp.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                        <td className="px-4 py-2 text-neutral-900 dark:text-neutral-100">
                          {exp.title} — {exp.company}
                        </td>
                        <td className="px-4 py-2 text-neutral-700 dark:text-neutral-300">{formatEuros(total)}</td>
                        <td className="px-4 py-2">
                          {deltaPercent === null ? (
                            <span className="text-neutral-400">—</span>
                          ) : (
                            <span className={deltaPercent >= 0 ? "text-green-600" : "text-red-600"}>
                              {deltaPercent >= 0 ? "+" : ""}
                              {deltaPercent.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
