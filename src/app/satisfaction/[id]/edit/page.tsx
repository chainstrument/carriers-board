import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { satisfactionEntries } from "@/lib/db/schema";
import { upsertEntry, deleteEntry } from "../../actions";
import { EntryForm } from "../../entry-form";

export default async function EditSatisfactionEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const entry = await db.query.satisfactionEntries.findFirst({
    where: and(eq(satisfactionEntries.id, id), eq(satisfactionEntries.userId, userId)),
  });
  if (!entry) notFound();

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

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Modifier l&apos;évaluation
          </h2>
          <EntryForm action={upsertEntry} defaultValues={entry} monthLocked />
        </div>

        <form action={deleteEntry.bind(null, entry.id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Supprimer cette évaluation
          </button>
        </form>
      </main>
    </div>
  );
}
