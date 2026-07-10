"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "./actions";
import { TechTagInput } from "./tech-tag-input";
import type { Experience } from "@/lib/db/schema";

const REMOTE_OPTIONS = [
  { value: "", label: "Non précisé" },
  { value: "presentiel", label: "Présentiel" },
  { value: "hybride", label: "Hybride" },
  { value: "full_remote", label: "Full remote" },
];

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function ExperienceForm({
  action,
  defaultValues,
  defaultTechnologies = [],
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<Experience>;
  defaultTechnologies?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [clientError, setClientError] = useState<string | null>(null);

  // Le champ "date de fin" n'est requis que si "poste actuel" n'est pas
  // coché : cette règle croisée ne peut pas s'exprimer avec `required`
  // seul. On la vérifie ici pour bloquer l'envoi côté client, car un
  // aller-retour serveur qui échoue réinitialise le formulaire (React vide
  // les champs non contrôlés après une action) et ferait perdre toute la
  // saisie de l'utilisateur.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const isCurrent = (form.elements.namedItem("isCurrent") as HTMLInputElement).checked;
    const endDate = (form.elements.namedItem("endDate") as HTMLInputElement).value;
    if (!isCurrent && !endDate) {
      e.preventDefault();
      setClientError("La date de fin est requise (ou coche 'poste actuel').");
      return;
    }
    setClientError(null);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="company" label="Entreprise">
          <input id="company" name="company" required defaultValue={defaultValues?.company} className={inputClass} />
        </Field>
        <Field id="title" label="Poste">
          <input id="title" name="title" required defaultValue={defaultValues?.title} className={inputClass} />
        </Field>
        <Field id="location" label="Localisation">
          <input id="location" name="location" defaultValue={defaultValues?.location ?? ""} className={inputClass} />
        </Field>
        <Field id="remoteType" label="Télétravail">
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
        </Field>
        <Field id="startDate" label="Date de début">
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={defaultValues?.startDate ?? ""}
            className={inputClass}
          />
        </Field>
        <Field id="endDate" label="Date de fin">
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={defaultValues?.endDate ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <input type="checkbox" name="isCurrent" defaultChecked={!defaultValues?.endDate && !!defaultValues} />
        Poste actuel
      </label>

      <Field id="manager" label="Manager">
        <input id="manager" name="manager" defaultValue={defaultValues?.manager ?? ""} className={inputClass} />
      </Field>

      <TechTagInput defaultTags={defaultTechnologies} />

      <Field id="missions" label="Missions">
        <textarea id="missions" name="missions" rows={4} defaultValue={defaultValues?.missions ?? ""} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="positives" label="Points positifs">
          <textarea id="positives" name="positives" rows={3} defaultValue={defaultValues?.positives ?? ""} className={inputClass} />
        </Field>
        <Field id="negatives" label="Points négatifs">
          <textarea id="negatives" name="negatives" rows={3} defaultValue={defaultValues?.negatives ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field id="departureReason" label="Raison du départ">
        <input
          id="departureReason"
          name="departureReason"
          defaultValue={defaultValues?.departureReason ?? ""}
          className={inputClass}
        />
      </Field>

      <Field id="learnings" label="Ce que j'ai appris">
        <textarea id="learnings" name="learnings" rows={3} defaultValue={defaultValues?.learnings ?? ""} className={inputClass} />
      </Field>

      {(clientError || state?.error) && (
        <p className="text-sm text-red-600">{clientError ?? state?.error}</p>
      )}

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
