"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { Cv } from "@/lib/db/schema";
import type { CvOption } from "@/lib/cvs";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

const TEMPLATE_OPTIONS = [
  { value: "classique", label: "Classique" },
  { value: "deux_colonnes", label: "Deux colonnes avec sidebar" },
];

function CheckboxGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: CvOption[];
  selected: string[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-neutral-500">{title}</h3>
      {options.length === 0 ? (
        <p className="text-sm text-neutral-500">Rien à sélectionner pour l&apos;instant.</p>
      ) : (
        <div className="space-y-1.5">
          {options.map((o) => (
            <label key={o.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name={name}
                value={o.id}
                defaultChecked={selected.includes(o.id)}
                className="mt-0.5"
              />
              <span>
                {o.label}
                {o.sublabel && (
                  <span className="text-neutral-400"> — {o.sublabel}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function CvForm({
  action,
  defaultValues,
  experienceOptions,
  competenceOptions,
  formationOptions,
  selectedExperienceIds = [],
  selectedCompetenceIds = [],
  selectedFormationIds = [],
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<Cv>;
  experienceOptions: CvOption[];
  competenceOptions: CvOption[];
  formationOptions: CvOption[];
  selectedExperienceIds?: string[];
  selectedCompetenceIds?: string[];
  selectedFormationIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm text-neutral-600 dark:text-neutral-400">
          Nom du CV
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="CV Backend - Acme"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm text-neutral-600 dark:text-neutral-400">
          Titre affiché sur le CV
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues?.title}
          placeholder="Développeur Web Fullstack"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Template</span>
        <div className="flex gap-4">
          {TEMPLATE_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="template"
                value={o.value}
                defaultChecked={(defaultValues?.template ?? "classique") === o.value}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="summary" className="text-sm text-neutral-600 dark:text-neutral-400">
          Accroche / résumé
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={defaultValues?.summary ?? ""}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="languages" className="text-sm text-neutral-600 dark:text-neutral-400">
          Langues
        </label>
        <input
          id="languages"
          name="languages"
          defaultValue={defaultValues?.languages ?? ""}
          placeholder="Anglais courant, Allemand notions"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <input
          type="checkbox"
          name="showMissions"
          defaultChecked={defaultValues?.showMissions ?? true}
        />
        Afficher les missions des expériences sélectionnées
      </label>

      <CheckboxGroup
        title="Expériences"
        name="experienceIds"
        options={experienceOptions}
        selected={selectedExperienceIds}
      />
      <CheckboxGroup
        title="Compétences"
        name="competenceIds"
        options={competenceOptions}
        selected={selectedCompetenceIds}
      />
      <CheckboxGroup
        title="Diplômes"
        name="academicFormationIds"
        options={formationOptions}
        selected={selectedFormationIds}
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
