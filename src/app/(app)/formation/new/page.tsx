import Link from "next/link";
import { createItem } from "../actions";
import { ItemForm } from "../item-form";

export default function NewTrainingItemPage() {
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
      <ItemForm action={createItem} submitLabel="Créer" />
    </div>
  );
}
