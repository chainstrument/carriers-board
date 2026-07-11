import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listJournalEntries } from "@/lib/journal";
import { moodEmoji } from "@/lib/mood";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function JournalPage() {
  const userId = await requireUserId();
  const entries = await listJournalEntries(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Journal professionnel
        </h2>
        <Link
          href="/journal/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouvelle note
        </Link>
      </div>

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
              <p className="flex items-center gap-2 text-xs text-neutral-500">
                {dateFormatter.format(new Date(entry.entryDate))}
                {moodEmoji(entry.mood) && <span>{moodEmoji(entry.mood)}</span>}
                {entry.experience && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                    {entry.experience.company}
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
