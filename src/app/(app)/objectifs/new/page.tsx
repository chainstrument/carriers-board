import Link from "next/link";
import { createGoal } from "../actions";
import { GoalForm } from "../goal-form";

export default function NewGoalPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/objectifs"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvel objectif
      </h2>
      <GoalForm action={createGoal} submitLabel="Créer" />
    </div>
  );
}
