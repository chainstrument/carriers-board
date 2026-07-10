import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";

export async function listJournalEntries(userId: string) {
  const rows = await db.query.journalEntries.findMany({
    where: eq(journalEntries.userId, userId),
    orderBy: [desc(journalEntries.entryDate), desc(journalEntries.createdAt)],
    with: { journalEntryTags: { with: { tag: true } }, experience: true },
  });

  return rows.map((row) => ({ ...row, tags: row.journalEntryTags.map((jt) => jt.tag.name) }));
}

export async function getJournalEntry(userId: string, entryId: string) {
  const row = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)),
    with: { journalEntryTags: { with: { tag: true } }, experience: true },
  });
  if (!row) return null;

  return { ...row, tags: row.journalEntryTags.map((jt) => jt.tag.name) };
}
