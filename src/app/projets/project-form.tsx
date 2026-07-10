"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { Project } from "@/lib/db/schema";
import { TagInput } from "@/components/tag-input";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function ProjectForm({
  action,
  defaultValues,
  defaultTechnologies = [],
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Project;
  defaultTechnologies?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-neutral-600 dark:text-neutral-400">
            Nom du projet
          </label>
          <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="client" className="text-sm text-neutral-600 dark:text-neutral-400">
            Client
          </label>
          <input id="client" name="client" defaultValue={defaultValues?.client ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="duration" className="text-sm text-neutral-600 dark:text-neutral-400">
            Durée
          </label>
          <input
            id="duration"
            name="duration"
            placeholder="3 mois, 2 semaines..."
            defaultValue={defaultValues?.duration ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="difficulty" className="text-sm text-neutral-600 dark:text-neutral-400">
            Difficulté (1-5)
          </label>
          <input
            id="difficulty"
            name="difficulty"
            type="number"
            min={1}
            max={5}
            defaultValue={defaultValues?.difficulty ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <TagInput
        name="technologies"
        label="Technologies"
        placeholder="PHP, Symfony, Docker..."
        defaultTags={defaultTechnologies}
      />

      <div className="space-y-1">
        <label htmlFor="impact" className="text-sm text-neutral-600 dark:text-neutral-400">
          Impact
        </label>
        <textarea
          id="impact"
          name="impact"
          rows={3}
          placeholder="Ce que le projet a changé concrètement..."
          defaultValue={defaultValues?.impact ?? ""}
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
