import Link from "next/link";
import { upsertEntry } from "../actions";
import { EntryForm } from "../entry-form";

export default function NewSatisfactionEntryPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/satisfaction" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Nouvelle évaluation
        </h2>
        <p className="mb-8 text-sm text-neutral-500">
          Une évaluation par mois — en enregistrer une nouvelle pour un mois déjà noté remplace
          l&apos;ancienne.
        </p>
        <EntryForm action={upsertEntry} />
      </main>
    </div>
  );
}
