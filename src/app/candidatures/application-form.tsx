"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { JobApplication } from "@/lib/db/schema";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

const REMOTE_OPTIONS = [
  { value: "", label: "Non précisé" },
  { value: "presentiel", label: "Présentiel" },
  { value: "hybride", label: "Hybride" },
  { value: "full_remote", label: "Full remote" },
];

export function ApplicationForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: JobApplication;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="company" className="text-sm text-neutral-600 dark:text-neutral-400">
            Entreprise
          </label>
          <input id="company" name="company" required defaultValue={defaultValues?.company} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm text-neutral-600 dark:text-neutral-400">
            Ville
          </label>
          <input id="city" name="city" defaultValue={defaultValues?.city ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="salary" className="text-sm text-neutral-600 dark:text-neutral-400">
            Salaire annoncé (€/an)
          </label>
          <input
            id="salary"
            name="salary"
            type="number"
            min={0}
            defaultValue={defaultValues?.salary ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="remoteType" className="text-sm text-neutral-600 dark:text-neutral-400">
            Télétravail
          </label>
          <select
            id="remoteType"
            name="remoteType"
            defaultValue={defaultValues?.remoteType ?? ""}
            className={inputClass}
          >
            {REMOTE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="link" className="text-sm text-neutral-600 dark:text-neutral-400">
          Lien de l&apos;offre
        </label>
        <input id="link" name="link" defaultValue={defaultValues?.link ?? ""} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm text-neutral-600 dark:text-neutral-400">
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
