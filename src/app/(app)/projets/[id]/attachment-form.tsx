"use client";

import { useActionState } from "react";
import type { AttachmentActionState } from "../actions";

export function AttachmentForm({
  action,
}: {
  action: (
    prevState: AttachmentActionState,
    formData: FormData,
  ) => Promise<AttachmentActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 space-y-1">
        <label htmlFor="label" className="text-xs text-neutral-500">
          Libellé
        </label>
        <input
          id="label"
          name="label"
          required
          placeholder="Screenshot dashboard"
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <div className="flex-1 space-y-1">
        <label htmlFor="url" className="text-xs text-neutral-500">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://..."
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
      >
        {pending ? "..." : "Ajouter"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
