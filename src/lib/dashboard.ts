import { and, desc, inArray, isNotNull, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { competences, experiences, goals, journalEntries, satisfactionEntries } from "@/lib/db/schema";

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

export async function getTopCompetences(limit = 5) {
  return db.query.competences.findMany({
    where: isNotNull(competences.level),
    orderBy: [desc(competences.level), desc(competences.confidence)],
    limit,
  });
}

export async function getActiveGoals(userId: string, limit = 4) {
  return db.query.goals.findMany({
    where: and(eq(goals.userId, userId), inArray(goals.status, ["todo", "in_progress"])),
    orderBy: [desc(goals.priority)],
    limit,
  });
}
