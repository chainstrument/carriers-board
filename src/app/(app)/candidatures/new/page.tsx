import Link from "next/link";
import { createApplication } from "../actions";
import { ApplicationForm } from "../application-form";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/candidatures"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle entreprise ciblée
      </h2>
      <ApplicationForm action={createApplication} submitLabel="Créer" />
    </div>
  );
}
