import Link from "next/link";
import { upsertEntry } from "../actions";
import { EntryForm } from "../entry-form";

export default function NewSatisfactionEntryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/satisfaction"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-2 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle évaluation
      </h2>
      <p className="mb-8 text-sm text-neutral-500">
        Une évaluation par mois — en enregistrer une nouvelle pour un mois déjà
        noté remplace l&apos;ancienne.
      </p>
      <EntryForm action={upsertEntry} />
    </div>
  );
}
