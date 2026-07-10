import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type Theme = "light" | "dark" | "dev";

export async function getCurrentTheme(): Promise<Theme> {
  const session = await auth();
  if (!session?.user?.id) return "light";

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { theme: true },
  });
  return user?.theme ?? "light";
}
