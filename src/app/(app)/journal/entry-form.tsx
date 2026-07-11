"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { JournalEntry } from "@/lib/db/schema";
import { TagInput } from "@/components/tag-input";
import { MOOD_OPTIONS } from "@/lib/mood";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function EntryForm({
  action,
  defaultValues,
  defaultTags = [],
  experiences = [],
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: JournalEntry;
  defaultTags?: string[];
  experiences?: { id: string; company: string; title: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="entryDate"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Date
        </label>
        <input
          id="entryDate"
          name="entryDate"
          type="date"
          required
          defaultValue={defaultValues?.entryDate ?? todayIso()}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="content"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          Note
        </label>
        <textarea
          id="content"
          name="content"
          rows={8}
          required
          defaultValue={defaultValues?.content}
          placeholder="Qu'est-ce qui s'est passé aujourd'hui ?"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Humeur
        </span>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-neutral-200 px-3 py-2 text-xs has-[:checked]:border-neutral-500 dark:border-neutral-800"
            >
              <input
                type="radio"
                name="mood"
                value={option.value}
                defaultChecked={defaultValues?.mood === option.value}
                className="sr-only"
              />
              <span className="text-lg">{option.emoji}</span>
              <span className="text-neutral-500">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {experiences.length > 0 && (
        <div className="space-y-1">
          <label
            htmlFor="experienceId"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Entreprise / expérience liée
          </label>
          <select
            id="experienceId"
            name="experienceId"
            defaultValue={defaultValues?.experienceId ?? ""}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="">Aucune</option>
            {experiences.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title} — {exp.company}
              </option>
            ))}
          </select>
        </div>
      )}

      <TagInput
        name="tags"
        label="Tags"
        placeholder="rachat, conflit, fierté..."
        defaultTags={defaultTags}
      />

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
