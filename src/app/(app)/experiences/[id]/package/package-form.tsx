"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import type { SalaryPackage } from "@/lib/db/schema";

type NumericField =
  | "baseSalary"
  | "bonus"
  | "profitSharing"
  | "profitIncentive"
  | "mealVouchersAnnual"
  | "healthInsuranceAnnual"
  | "transportAnnual"
  | "benefitsInKindAnnual"
  | "rttDays";

const FIELDS: { name: NumericField; label: string; required?: boolean }[] = [
  { name: "baseSalary", label: "Salaire fixe annuel (€)", required: true },
  { name: "bonus", label: "Bonus annuel (€)" },
  { name: "profitSharing", label: "Participation (€/an)" },
  { name: "profitIncentive", label: "Intéressement (€/an)" },
  { name: "mealVouchersAnnual", label: "Tickets restaurant (€/an)" },
  { name: "healthInsuranceAnnual", label: "Mutuelle (€/an, part employeur)" },
  { name: "transportAnnual", label: "Transport (€/an)" },
  { name: "benefitsInKindAnnual", label: "Autres avantages (CE, etc.) (€/an)" },
  { name: "rttDays", label: "RTT (jours/an)" },
];

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export function PackageForm({
  action,
  defaultValues,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: SalaryPackage | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className="space-y-1">
            <label
              htmlFor={field.name}
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              min={0}
              required={field.required}
              defaultValue={
                defaultValues?.[field.name] ?? (field.required ? undefined : 0)
              }
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {pending ? "Enregistrement..." : "Enregistrer le package"}
      </button>
    </form>
  );
}
