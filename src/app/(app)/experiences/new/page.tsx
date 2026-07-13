import Link from "next/link";
import { createExperience } from "../actions";
import { ExperienceForm } from "../experience-form";
import type { Experience } from "@/lib/db/schema";

export default async function NewExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    isCurrent?: string;
    company?: string;
    title?: string;
    missions?: string;
    technologies?: string;
  }>;
}) {
  const params = await searchParams;
  const hasPrefill = Boolean(params.startDate);
  const defaultValues: Partial<Experience> | undefined = hasPrefill
    ? {
        startDate: params.startDate,
        endDate: params.isCurrent ? null : (params.endDate ?? null),
        company: params.company,
        title: params.title,
        missions: params.missions,
      }
    : undefined;
  const defaultTechnologies = params.technologies
    ? params.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/experiences"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour au parcours
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle expérience
      </h2>
      {hasPrefill && (
        <p className="mb-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Champs pré-remplis depuis l&apos;import CV — vérifie-les et complète
          le reste.
        </p>
      )}
      <ExperienceForm
        action={createExperience}
        submitLabel="Créer"
        defaultValues={defaultValues}
        defaultTechnologies={defaultTechnologies}
      />
    </div>
  );
}
