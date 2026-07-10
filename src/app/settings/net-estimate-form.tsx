"use client";

import { useActionState } from "react";
import { updateNetEstimateRatio } from "./actions";

export function NetEstimateForm({ current }: { current: number }) {
  const [state, formAction, pending] = useActionState(updateNetEstimateRatio, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Estimation du net</h3>
      <p className="text-sm text-neutral-500">
        Coefficient approximatif appliqué au package annuel pour estimer le net (pas un vrai
        calcul de paie).
      </p>

      <div className="space-y-1">
        <label htmlFor="netEstimateRatio" className="text-sm text-neutral-600 dark:text-neutral-400">
          Coefficient (ex. 0.78 pour ~78%)
        </label>
        <input
          id="netEstimateRatio"
          name="netEstimateRatio"
          type="number"
          step="0.01"
          min="0.1"
          max="1"
          defaultValue={current}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
