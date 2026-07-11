import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getExperienceWithTech } from "@/lib/experiences";
import {
  computeNetEstimate,
  computePackageTotal,
  formatEuros,
  getNetEstimateRatio,
} from "@/lib/package";
import { formatDateRange, durationLabel } from "../date-range";
import { deleteExperience } from "../actions";

function Section({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
        {content}
      </p>
    </div>
  );
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const experience = await getExperienceWithTech(userId, id);
  if (!experience) notFound();

  const netEstimateRatio = experience.salaryPackage
    ? await getNetEstimateRatio(userId)
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Link
        href="/experiences"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour au parcours
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {experience.title} — {experience.company}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatDateRange(experience.startDate, experience.endDate)} ·{" "}
            {durationLabel(experience.startDate, experience.endDate)}
            {experience.location ? ` · ${experience.location}` : ""}
            {experience.remoteType
              ? ` · ${experience.remoteType.replace("_", " ")}`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/experiences/${experience.id}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Modifier
          </Link>
          <form action={deleteExperience.bind(null, experience.id)}>
            <button
              type="submit"
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-900"
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>

      {experience.manager && (
        <p className="text-sm text-neutral-500">
          Manager : {experience.manager}
        </p>
      )}

      {experience.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {experience.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Package salarial
          </h3>
          <Link
            href={`/experiences/${experience.id}/package`}
            className="text-sm underline"
          >
            {experience.salaryPackage ? "Modifier" : "Configurer"}
          </Link>
        </div>
        {experience.salaryPackage && netEstimateRatio !== null ? (
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-neutral-500">Package annuel</dt>
            <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
              {formatEuros(computePackageTotal(experience.salaryPackage))}
            </dd>
            <dt className="text-neutral-500">Net estimé</dt>
            <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
              {formatEuros(
                computeNetEstimate(experience.salaryPackage, netEstimateRatio),
              )}
            </dd>
          </dl>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">Pas encore configuré.</p>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <Section title="Missions" content={experience.missions} />
        <Section title="Points positifs" content={experience.positives} />
        <Section title="Points négatifs" content={experience.negatives} />
        <Section
          title="Raison du départ"
          content={experience.departureReason}
        />
        <Section title="Ce que j'ai appris" content={experience.learnings} />
      </div>
    </div>
  );
}
