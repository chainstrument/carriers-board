"use client";

import { useActionState } from "react";
import type { Theme } from "@/lib/theme";
import { updateTheme } from "./actions";

const OPTIONS: { value: Theme; label: string; description: string }[] = [
  { value: "light", label: "Clair", description: "Thème par défaut." },
  { value: "dark", label: "Sombre", description: "Fond sombre, texte clair." },
  {
    value: "dev",
    label: "Dev",
    description: "Esthétique terminal, police mono.",
  },
];

export function ThemeForm({ current }: { current: Theme }) {
  const [state, formAction, pending] = useActionState(updateTheme, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
    >
      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
        Thème
      </h3>

      <div className="space-y-2">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-neutral-200 p-3 text-sm has-[:checked]:border-neutral-500 dark:border-neutral-800"
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              defaultChecked={current === option.value}
              className="mt-1"
            />
            <span>
              <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                {option.label}
              </span>
              <span className="block text-neutral-500">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">{state.success}</p>
      )}

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
