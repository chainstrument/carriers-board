import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getJournalEntry } from "@/lib/journal";
import { listExperiencesSummary } from "@/lib/experiences";
import { updateEntry, deleteEntry } from "../../actions";
import { EntryForm } from "../../entry-form";

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const [entry, experiences] = await Promise.all([
    getJournalEntry(userId, id),
    listExperiencesSummary(userId),
  ]);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/journal"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour au journal
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier la note
        </h2>
        <EntryForm
          action={updateEntry.bind(null, entry.id)}
          defaultValues={entry}
          defaultTags={entry.tags}
          experiences={experiences}
          submitLabel="Enregistrer"
        />
      </div>

      <form action={deleteEntry.bind(null, entry.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cette note
        </button>
      </form>
    </div>
  );
}
