"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { TrainingItem } from "@/lib/db/schema";
import { TYPE_OPTIONS, STATUS_OPTIONS } from "@/lib/formation";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function ItemForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<TrainingItem>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="type"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={defaultValues?.type ?? "book"}
            className={inputClass}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="status"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            État
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "todo"}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="title"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Titre
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="source"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Source (lien, référence...)
          </label>
          <input
            id="source"
            name="source"
            defaultValue={defaultValues?.source ?? ""}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="timeSpentMinutes"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Temps passé (minutes)
          </label>
          <input
            id="timeSpentMinutes"
            name="timeSpentMinutes"
            type="number"
            min={0}
            defaultValue={defaultValues?.timeSpentMinutes ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="notes"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          className={inputClass}
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
