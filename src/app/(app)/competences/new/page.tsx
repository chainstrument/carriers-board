import Link from "next/link";
import { createCompetence } from "../actions";
import { CompetenceForm } from "../competence-form";

export default function NewCompetencePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/competences"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle compétence
      </h2>
      <CompetenceForm action={createCompetence} submitLabel="Créer" />
    </div>
  );
}
