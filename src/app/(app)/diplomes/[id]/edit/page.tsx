import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { academicFormations } from "@/lib/db/schema";
import { updateAcademicFormation, deleteAcademicFormation } from "../../actions";
import { FormationForm } from "../../formation-form";

export default async function EditAcademicFormationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const item = await db.query.academicFormations.findFirst({
    where: and(eq(academicFormations.id, id), eq(academicFormations.userId, userId)),
  });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/diplomes"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier le diplôme
        </h2>
        <FormationForm
          action={updateAcademicFormation.bind(null, item.id)}
          defaultValues={item}
          submitLabel="Enregistrer"
        />
      </div>

      <form action={deleteAcademicFormation.bind(null, item.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer
        </button>
      </form>
    </div>
  );
}
