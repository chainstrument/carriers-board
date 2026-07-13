"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "./actions";

export function ProfileForms({
  name,
  email,
  image,
  phone,
  address,
  linkedinUrl,
  websiteUrl,
}: {
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  address: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    undefined,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    undefined,
  );

  return (
    <div className="space-y-10">
      <form
        action={profileAction}
        className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
      >
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
          Informations
        </h3>

        <div className="space-y-1">
          <label className="text-sm text-neutral-600 dark:text-neutral-400">
            Email
          </label>
          <input
            disabled
            value={email}
            className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Nom
          </label>
          <input
            id="name"
            name="name"
            defaultValue={name}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="image"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Avatar (URL)
          </label>
          <input
            id="image"
            name="image"
            defaultValue={image ?? ""}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="phone"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={phone ?? ""}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="address"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Adresse
          </label>
          <input
            id="address"
            name="address"
            defaultValue={address ?? ""}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="linkedinUrl"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            LinkedIn
          </label>
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            defaultValue={linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="websiteUrl"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Site / portfolio
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            defaultValue={websiteUrl ?? ""}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <p className="text-xs text-neutral-400">
          Ces informations servent d&apos;en-tête aux CV générés dans le
          module CV.
        </p>

        {profileState?.error && (
          <p className="text-sm text-red-600">{profileState.error}</p>
        )}
        {profileState?.success && (
          <p className="text-sm text-green-600">{profileState.success}</p>
        )}

        <button
          type="submit"
          disabled={profilePending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {profilePending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <form
        action={passwordAction}
        className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
      >
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
          Mot de passe
        </h3>

        <div className="space-y-1">
          <label
            htmlFor="currentPassword"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Mot de passe actuel
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="newPassword"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        {passwordState?.error && (
          <p className="text-sm text-red-600">{passwordState.error}</p>
        )}

        <button
          type="submit"
          disabled={passwordPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {passwordPending ? "Changement..." : "Changer le mot de passe"}
        </button>
        <p className="text-xs text-neutral-500">
          Tu seras déconnecté après le changement de mot de passe.
        </p>
      </form>
    </div>
  );
}
