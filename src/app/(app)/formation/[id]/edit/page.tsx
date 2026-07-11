import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { trainingItems } from "@/lib/db/schema";
import { updateItem, deleteItem } from "../../actions";
import { ItemForm } from "../../item-form";

export default async function EditTrainingItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const item = await db.query.trainingItems.findFirst({
    where: and(eq(trainingItems.id, id), eq(trainingItems.userId, userId)),
  });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/formation"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier la formation
        </h2>
        <ItemForm
          action={updateItem.bind(null, item.id)}
          defaultValues={item}
          submitLabel="Enregistrer"
        />
      </div>

      <form action={deleteItem.bind(null, item.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer
        </button>
      </form>
    </div>
  );
}
