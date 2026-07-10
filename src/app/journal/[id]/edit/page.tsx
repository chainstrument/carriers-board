import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getJournalEntry } from "@/lib/journal";
import { updateEntry, deleteEntry } from "../../actions";
import { EntryForm } from "../../entry-form";

export default async function EditJournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const entry = await getJournalEntry(userId, id);
  if (!entry) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/journal" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour au journal
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Modifier la note
          </h2>
          <EntryForm
            action={updateEntry.bind(null, entry.id)}
            defaultValues={entry}
            defaultTags={entry.tags}
            submitLabel="Enregistrer"
          />
        </div>

        <form action={deleteEntry.bind(null, entry.id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Supprimer cette note
          </button>
        </form>
      </main>
    </div>
  );
}
