import Link from "next/link";
import { createApplication } from "../actions";
import { ApplicationForm } from "../application-form";

export default function NewApplicationPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/candidatures" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Nouvelle entreprise ciblée
        </h2>
        <ApplicationForm action={createApplication} submitLabel="Créer" />
      </main>
    </div>
  );
}
