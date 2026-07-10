"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { Competence } from "@/lib/db/schema";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function CompetenceForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Competence;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-neutral-600 dark:text-neutral-400">
            Nom
          </label>
          <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm text-neutral-600 dark:text-neutral-400">
            Catégorie
          </label>
          <input
            id="category"
            name="category"
            defaultValue={defaultValues?.category ?? ""}
            placeholder="Langage, Framework, DevOps, Cloud..."
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="level" className="text-sm text-neutral-600 dark:text-neutral-400">
            Niveau (1-5)
          </label>
          <input
            id="level"
            name="level"
            type="number"
            min={1}
            max={5}
            defaultValue={defaultValues?.level ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confidence" className="text-sm text-neutral-600 dark:text-neutral-400">
            Confiance (1-5)
          </label>
          <input
            id="confidence"
            name="confidence"
            type="number"
            min={1}
            max={5}
            defaultValue={defaultValues?.confidence ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="yearsOfExperience" className="text-sm text-neutral-600 dark:text-neutral-400">
            Années d&apos;expérience
          </label>
          <input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            defaultValue={defaultValues?.yearsOfExperience ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="manualLastUsedAt" className="text-sm text-neutral-600 dark:text-neutral-400">
            Dernière utilisation (si non liée à une expérience)
          </label>
          <input
            id="manualLastUsedAt"
            name="manualLastUsedAt"
            type="date"
            defaultValue={defaultValues?.manualLastUsedAt ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <input type="checkbox" name="wantsToImprove" defaultChecked={defaultValues?.wantsToImprove} />
        Envie de progresser sur cette compétence
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
