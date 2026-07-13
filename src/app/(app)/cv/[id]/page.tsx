import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { buildCvData, cvDownloadFilename, getCvWithSelections } from "@/lib/cvs";
import { formatDateRange } from "../../experiences/date-range";

function remoteLabel(days: number | null): string | null {
  if (days === null) return null;
  return days === 0 ? "présentiel" : `${days} j télétravail/sem.`;
}

function formationYearLabel(startYear: number, endYear: number | null): string {
  return endYear && endYear !== startYear ? `${startYear}-${endYear}` : String(startYear);
}

export default async function CvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const [cv, data] = await Promise.all([
    getCvWithSelections(userId, id),
    buildCvData(userId, id),
  ]);
  if (!cv || !data) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Link
        href="/cv"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour aux CV
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {cv.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{cv.title}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/cv/${cv.id}/download`}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Télécharger ({cvDownloadFilename(cv.name)})
          </a>
          <Link
            href={`/cv/${cv.id}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Modifier
          </Link>
        </div>
      </div>

      <div className="space-y-6 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {data.userName}
          </h3>
          <p className="text-sm italic text-neutral-600 dark:text-neutral-400">
            {data.title}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {[data.email, data.phone, data.address, data.linkedinUrl, data.websiteUrl]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {data.summary && (
          <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.summary}</p>
        )}

        {data.competences.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-neutral-500">Compétences</h4>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              {data.competences.join(", ")}
            </p>
          </div>
        )}

        {data.experiences.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-neutral-500">
              Expériences professionnelles
            </h4>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <div key={i}>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {exp.title} — {exp.company}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[
                      formatDateRange(exp.startDate, exp.endDate),
                      exp.location,
                      remoteLabel(exp.remoteDaysPerWeek),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {exp.missions && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                      {exp.missions}
                    </p>
                  )}
                  {exp.technologies.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Technologies : {exp.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.formations.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-neutral-500">Formation</h4>
            <div className="space-y-1">
              {data.formations.map((f, i) => (
                <p key={i} className="text-sm text-neutral-800 dark:text-neutral-200">
                  <span className="font-medium">
                    {f.title}
                    {f.institution ? ` — ${f.institution}` : ""}
                  </span>{" "}
                  <span className="text-neutral-500">
                    ({formationYearLabel(f.startYear, f.endYear)})
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        {data.languages && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-neutral-500">Langues</h4>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.languages}</p>
          </div>
        )}
      </div>
    </div>
  );
}
