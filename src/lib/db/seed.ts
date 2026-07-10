import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("./index");
  const { users } = await import("./schema");
  const bcrypt = (await import("bcryptjs")).default;
  const { eq } = await import("drizzle-orm");

  const email = process.env.SEED_USER_EMAIL ?? "moi@careerboard.local";
  const password = process.env.SEED_USER_PASSWORD ?? "changeme123";
  const name = process.env.SEED_USER_NAME ?? "Moi";

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log(`Utilisateur deja present: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, name, passwordHash });

  console.log(`Utilisateur cree: ${email} / ${password} (a changer apres la premiere connexion)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
