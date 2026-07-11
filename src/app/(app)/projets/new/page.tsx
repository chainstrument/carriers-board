import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listExperiencesSummary } from "@/lib/experiences";
import { createProject } from "../actions";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const userId = await requireUserId();
  const experiences = await listExperiencesSummary(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/projets"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouveau projet
      </h2>
      <ProjectForm
        action={createProject}
        experiences={experiences}
        submitLabel="Créer"
      />
    </div>
  );
}
