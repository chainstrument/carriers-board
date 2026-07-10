import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listJournalEntries } from "@/lib/journal";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function JournalPage() {
  const userId = await requireUserId();
  const entries = await listJournalEntries(userId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/journal/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle note
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Journal professionnel
        </h2>

        {entries.length === 0 && (
          <p className="text-neutral-500">
            Aucune note pour l&apos;instant.{" "}
            <Link href="/journal/new" className="underline">
              Écris la première
            </Link>
            .
          </p>
        )}

        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/journal/${entry.id}/edit`}
                className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <p className="text-xs text-neutral-500">
                  {dateFormatter.format(new Date(entry.entryDate))}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
                  {entry.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
