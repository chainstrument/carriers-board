import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/db/schema";
import { updateApplication, deleteApplication } from "../../actions";
import { ApplicationForm } from "../../application-form";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const application = await db.query.jobApplications.findFirst({
    where: and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
  });
  if (!application) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/candidatures" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div>
          <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
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
      </main>
    </div>
  );
}
