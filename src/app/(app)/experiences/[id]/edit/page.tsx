import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { getExperienceWithTech } from "@/lib/experiences";
import { updateExperience } from "../../actions";
import { ExperienceForm } from "../../experience-form";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const experience = await getExperienceWithTech(userId, id);
  if (!experience) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={`/experiences/${experience.id}`}
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Modifier l&apos;expérience
      </h2>
      <ExperienceForm
        action={updateExperience.bind(null, experience.id)}
        defaultValues={experience}
        defaultTechnologies={experience.technologies}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
