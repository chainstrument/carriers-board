"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "./actions";
import type { SatisfactionEntry } from "@/lib/db/schema";
import { CRITERIA } from "@/lib/satisfaction";

function currentMonthIso() {
  return new Date().toISOString().slice(0, 7);
}

function RatingSlider({
  criterionKey,
  label,
  defaultValue,
}: {
  criterionKey: string;
  label: string;
  defaultValue: number;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <label
          htmlFor={criterionKey}
          className="text-neutral-600 dark:text-neutral-400"
        >
          {label}
        </label>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {value}/10
        </span>
      </div>
      <input
        id={criterionKey}
        name={criterionKey}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export function EntryForm({
  action,
  defaultValues,
  monthLocked,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: SatisfactionEntry;
  monthLocked?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const defaultMonth = defaultValues
    ? defaultValues.month.slice(0, 7)
    : currentMonthIso();

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-1">
        <label
          htmlFor="month"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Mois
        </label>
        <input
          id="month"
          name="month"
          type="month"
          required
          disabled={monthLocked}
          defaultValue={defaultMonth}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CRITERIA.map((c) => (
          <RatingSlider
            key={c.key}
            criterionKey={c.key}
            label={c.label}
            defaultValue={(defaultValues?.[c.key] as number) ?? 5}
          />
        ))}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="notes"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

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
