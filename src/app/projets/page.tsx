import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listProjectsWithTech } from "@/lib/projects";

export default async function ProjectsPage() {
  const userId = await requireUserId();
  const projects = await listProjectsWithTech(userId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </Link>
        <Link
          href="/projets/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouveau projet
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Projets
        </h2>

        {projects.length === 0 && (
          <p className="text-neutral-500">
            Aucun projet pour l&apos;instant.{" "}
            <Link href="/projets/new" className="underline">
              Ajoute le premier
            </Link>
            .
          </p>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projets/${project.id}`}
              className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{project.name}</h3>
                {project.duration && <span className="text-xs text-neutral-500">{project.duration}</span>}
              </div>
              {project.client && <p className="mt-1 text-sm text-neutral-500">{project.client}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                {project.experience ? project.experience.company : "Side project"}
              </p>
              {project.technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
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
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
