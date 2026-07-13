import Link from "next/link";
import { createItem } from "../actions";
import { ItemForm } from "../item-form";
import type { TrainingItem } from "@/lib/db/schema";

export default async function NewTrainingItemPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; year?: string }>;
}) {
  const params = await searchParams;
  const hasPrefill = Boolean(params.title);
  const defaultValues: Partial<TrainingItem> | undefined = hasPrefill
    ? {
        title: params.title,
        notes: params.year ? `Période : ${params.year}` : undefined,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/formation"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle formation
      </h2>
      {hasPrefill && (
        <p className="mb-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Titre pré-rempli depuis l&apos;import CV — vérifie-le et complète le
          reste.
        </p>
      )}
      <ItemForm action={createItem} submitLabel="Créer" defaultValues={defaultValues} />
    </div>
  );
}
