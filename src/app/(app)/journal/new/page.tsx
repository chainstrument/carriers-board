import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listExperiencesSummary } from "@/lib/experiences";
import { createEntry } from "../actions";
import { EntryForm } from "../entry-form";

export default async function NewJournalEntryPage() {
  const userId = await requireUserId();
  const experiences = await listExperiencesSummary(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/journal"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour au journal
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle note
      </h2>
      <EntryForm
        action={createEntry}
        experiences={experiences}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
