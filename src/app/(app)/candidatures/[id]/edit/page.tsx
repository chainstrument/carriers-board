import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/db/schema";
import { updateApplication, deleteApplication } from "../../actions";
import { ApplicationForm } from "../../application-form";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const application = await db.query.jobApplications.findFirst({
    where: and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
  });
  if (!application) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/candidatures"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier l&apos;entreprise ciblée
        </h2>
        <ApplicationForm
          action={updateApplication.bind(null, application.id)}
          defaultValues={application}
          submitLabel="Enregistrer"
        />
      </div>

      <form action={deleteApplication.bind(null, application.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer
        </button>
      </form>
    </div>
  );
}
