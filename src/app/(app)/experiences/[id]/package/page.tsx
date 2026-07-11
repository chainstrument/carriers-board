import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { upsertPackage } from "./actions";
import { PackageForm } from "./package-form";

export default async function PackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const experience = await db.query.experiences.findFirst({
    where: and(eq(experiences.id, id), eq(experiences.userId, userId)),
    with: { salaryPackage: true },
  });
  if (!experience) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/experiences/${experience.id}`}
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-2 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Package salarial
      </h2>
      <p className="mb-8 text-sm text-neutral-500">
        {experience.title} — {experience.company}
      </p>
      <PackageForm
        action={upsertPackage.bind(null, experience.id)}
        defaultValues={experience.salaryPackage}
      />
    </div>
  );
}
