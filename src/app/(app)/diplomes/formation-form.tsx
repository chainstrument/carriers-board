"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { AcademicFormation } from "@/lib/db/schema";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function FormationForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<AcademicFormation>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="title"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Diplôme / intitulé
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="institution"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Établissement
        </label>
        <input
          id="institution"
          name="institution"
          defaultValue={defaultValues?.institution ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="startYear"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Année de début
          </label>
          <input
            id="startYear"
            name="startYear"
            type="number"
            required
            defaultValue={defaultValues?.startYear}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="endYear"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Année d&apos;obtention (si différente)
          </label>
          <input
            id="endYear"
            name="endYear"
            type="number"
            defaultValue={defaultValues?.endYear ?? ""}
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
          rows={3}
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
