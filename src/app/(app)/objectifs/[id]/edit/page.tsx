import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { updateGoal, deleteGoal } from "../../actions";
import { GoalForm } from "../../goal-form";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, id), eq(goals.userId, userId)),
  });
  if (!goal) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <Link
          href="/objectifs"
          className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Retour
        </Link>
        <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier l&apos;objectif
        </h2>
        <GoalForm
          action={updateGoal.bind(null, goal.id)}
          defaultValues={goal}
          submitLabel="Enregistrer"
        />
      </div>

      <form action={deleteGoal.bind(null, goal.id)}>
        <button type="submit" className="text-sm text-red-600 hover:underline">
          Supprimer cet objectif
        </button>
      </form>
    </div>
  );
}
