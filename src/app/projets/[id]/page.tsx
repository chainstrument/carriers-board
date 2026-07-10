import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getProjectWithTech } from "@/lib/projects";
import { LevelDots } from "@/components/level-dots";
import { deleteProject } from "../actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const project = await getProjectWithTech(userId, id);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link href="/projets" className="text-sm text-neutral-600 hover:underline dark:text-neutral-400">
          Retour aux projets
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-16">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{project.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {project.client}
              {project.client && project.duration ? " · " : ""}
              {project.duration}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/projets/${project.id}/edit`}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
            >
              Modifier
            </Link>
            <form action={deleteProject.bind(null, project.id)}>
              <button type="submit" className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-900">
                Supprimer
              </button>
            </form>
          </div>
        </div>

        {project.difficulty !== null && (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            Difficulté <LevelDots value={project.difficulty} />
          </p>
        )}

        <p className="text-sm text-neutral-500">
          {project.experience ? (
            <>
              Réalisé dans le cadre de{" "}
              <Link href={`/experiences/${project.experience.id}`} className="underline">
                {project.experience.title} — {project.experience.company}
              </Link>
            </>
          ) : (
            "Projet autonome (side project)"
          )}
        </p>

        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.impact && (
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Impact</h3>
            <p className="mt-1 whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{project.impact}</p>
          </div>
        )}
      </main>
    </div>
  );
}
