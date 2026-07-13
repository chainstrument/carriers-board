import Link from "next/link";
import { createAcademicFormation } from "../actions";
import { FormationForm } from "../formation-form";
import type { AcademicFormation } from "@/lib/db/schema";

export default async function NewAcademicFormationPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; institution?: string; startYear?: string; endYear?: string }>;
}) {
  const params = await searchParams;
  const hasPrefill = Boolean(params.title);
  const defaultValues: Partial<AcademicFormation> | undefined = hasPrefill
    ? {
        title: params.title,
        institution: params.institution,
        startYear: params.startYear ? Number(params.startYear) : undefined,
        endYear: params.endYear ? Number(params.endYear) : undefined,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/diplomes"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouveau diplôme
      </h2>
      {hasPrefill && (
        <p className="mb-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Champs pré-remplis depuis l&apos;import CV — vérifie-les et complète
          le reste.
        </p>
      )}
      <FormationForm
        action={createAcademicFormation}
        submitLabel="Créer"
        defaultValues={defaultValues}
      />
    </div>
  );
}
