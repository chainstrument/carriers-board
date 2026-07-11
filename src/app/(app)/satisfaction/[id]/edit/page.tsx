import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { satisfactionEntries } from "@/lib/db/schema";
import { upsertEntry, deleteEntry } from "../../actions";
import { EntryForm } from "../../entry-form";

export default async function EditSatisfactionEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const entry = await db.query.satisfactionEntries.findFirst({
    where: and(
      eq(satisfactionEntries.id, id),
      eq(satisfactionEntries.userId, userId),
    ),
  });
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/satisfaction"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier l&apos;évaluation
        </h2>
        <EntryForm action={upsertEntry} defaultValues={entry} monthLocked />
      </div>

      <form action={deleteEntry.bind(null, entry.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cette évaluation
        </button>
      </form>
    </div>
  );
}
