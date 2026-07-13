import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getCvWithSelections, listCvOptions } from "@/lib/cvs";
import { updateCv, deleteCv } from "../../actions";
import { CvForm } from "../../cv-form";

export default async function EditCvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const [cv, { experienceOptions, competenceOptions, formationOptions }] = await Promise.all([
    getCvWithSelections(userId, id),
    listCvOptions(userId),
  ]);
  if (!cv) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <div className="flex items-center justify-between">
          <Link
            href={`/cv/${cv.id}`}
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            ← Retour
          </Link>
          <a
            href={`/cv/${cv.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Aperçu (nouvel onglet)
          </a>
        </div>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier le CV
        </h2>
        <CvForm
          action={updateCv.bind(null, cv.id)}
          defaultValues={cv}
          submitLabel="Enregistrer"
          experienceOptions={experienceOptions}
          competenceOptions={competenceOptions}
          formationOptions={formationOptions}
          selectedExperienceIds={cv.experienceIds}
          selectedCompetenceIds={cv.competenceIds}
          selectedFormationIds={cv.academicFormationIds}
        />
      </div>

      <form action={deleteCv.bind(null, cv.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer
        </button>
      </form>
    </div>
  );
}
