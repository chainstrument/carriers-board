import { and, desc, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences, journalEntries, satisfactionEntries } from "@/lib/db/schema";

export async function getCurrentExperience(userId: string) {
  return db.query.experiences.findFirst({
    where: and(eq(experiences.userId, userId), isNull(experiences.endDate)),
    orderBy: [desc(experiences.startDate)],
    with: { salaryPackage: true },
  });
}

export async function getRecentSatisfaction(userId: string, limit = 2) {
  return db.query.satisfactionEntries.findMany({
    where: eq(satisfactionEntries.userId, userId),
    orderBy: [desc(satisfactionEntries.month)],
    limit,
  });
}

export async function getRecentJournalEntries(userId: string, limit = 3) {
  return db.query.journalEntries.findMany({
    where: eq(journalEntries.userId, userId),
    orderBy: [desc(journalEntries.entryDate), desc(journalEntries.createdAt)],
    limit,
  });
}
