import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetenceWithUsage } from "@/lib/competences";
import { formatDateRange } from "../../../experiences/date-range";
import { updateCompetence, deleteCompetence } from "../../actions";
import { CompetenceForm } from "../../competence-form";

export default async function EditCompetencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competence = await getCompetenceWithUsage(id);
  if (!competence) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/competences" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Modifier la compétence
          </h2>
          <CompetenceForm
            action={updateCompetence.bind(null, competence.id)}
            defaultValues={competence}
            submitLabel="Enregistrer"
          />
        </div>

        <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            Utilisée dans {competence.linkedExperiences.length} expérience
            {competence.linkedExperiences.length > 1 ? "s" : ""}
          </h3>
          {competence.linkedExperiences.length === 0 ? (
            <p className="mt-1 text-sm text-neutral-500">
              Pas encore liée à une expérience — la date de dernière utilisation ci-dessus est
              donc saisie manuellement.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-neutral-500">
                La dernière utilisation ({competence.lastUsed.date}) est calculée automatiquement
                à partir de ces expériences, le champ manuel est ignoré tant qu&apos;au moins une
                liaison existe.
              </p>
              <ul className="mt-3 space-y-2">
                {competence.linkedExperiences.map((exp) => (
                  <li key={exp.id}>
                    <Link href={`/experiences/${exp.id}`} className="text-sm underline">
                      {exp.title} — {exp.company}
                    </Link>
                    <span className="ml-2 text-xs text-neutral-500">
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 text-xs text-neutral-400">
            La liaison aux projets sera disponible une fois l&apos;Epic Projets implémenté.
          </p>
        </div>

        <form action={deleteCompetence.bind(null, competence.id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Supprimer cette compétence
          </button>
        </form>
      </main>
    </div>
  );
}
