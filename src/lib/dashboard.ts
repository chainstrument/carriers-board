import { and, desc, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";

export async function getCurrentExperience(userId: string) {
  return db.query.experiences.findFirst({
    where: and(eq(experiences.userId, userId), isNull(experiences.endDate)),
    orderBy: [desc(experiences.startDate)],
  });
}
