import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ProfileForms } from "./profile-forms";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Profil
      </h2>
      <ProfileForms
        name={user.name}
        email={user.email}
        image={user.image}
        phone={user.phone}
        address={user.address}
        linkedinUrl={user.linkedinUrl}
        websiteUrl={user.websiteUrl}
      />
    </div>
  );
}
