import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetenceWithUsage } from "@/lib/competences";
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

        <form action={deleteCompetence.bind(null, competence.id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Supprimer cette compétence
          </button>
        </form>
      </main>
    </div>
  );
}
