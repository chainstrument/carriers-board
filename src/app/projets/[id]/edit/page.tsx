import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getProjectWithTech } from "@/lib/projects";
import { listExperiencesSummary } from "@/lib/experiences";
import { updateProject } from "../../actions";
import { ProjectForm } from "../../project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const [project, experiences] = await Promise.all([
    getProjectWithTech(userId, id),
    listExperiencesSummary(userId),
  ]);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href={`/projets/${project.id}`} className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Modifier le projet
        </h2>
        <ProjectForm
          action={updateProject.bind(null, project.id)}
          defaultValues={project}
          defaultTechnologies={project.technologies}
          experiences={experiences}
          submitLabel="Enregistrer"
        />
      </main>
    </div>
  );
}
