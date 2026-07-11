import Link from "next/link";
import { createExperience } from "../actions";
import { ExperienceForm } from "../experience-form";

export default function NewExperiencePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/experiences"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour au parcours
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouvelle expérience
      </h2>
      <ExperienceForm action={createExperience} submitLabel="Créer" />
    </div>
  );
}
