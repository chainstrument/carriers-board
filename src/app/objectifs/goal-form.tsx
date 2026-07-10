"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "./actions";
import type { Goal } from "@/lib/db/schema";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/goals";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function GoalForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Goal;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [progress, setProgress] = useState(defaultValues?.progress ?? 0);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm text-neutral-600 dark:text-neutral-400">
          Titre
        </label>
        <input id="title" name="title" required defaultValue={defaultValues?.title} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm text-neutral-600 dark:text-neutral-400">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="deadline" className="text-sm text-neutral-600 dark:text-neutral-400">
            Date cible
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={defaultValues?.deadline ?? ""}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="text-sm text-neutral-600 dark:text-neutral-400">
            Priorité
          </label>
          <select id="priority" name="priority" defaultValue={defaultValues?.priority ?? "medium"} className={inputClass}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm text-neutral-600 dark:text-neutral-400">
            État
          </label>
          <select id="status" name="status" defaultValue={defaultValues?.status ?? "todo"} className={inputClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="progress" className="text-neutral-600 dark:text-neutral-400">
            Avancement
          </label>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{progress}%</span>
        </div>
        <input
          id="progress"
          name="progress"
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full"
        />
      </div>

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
