import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listCvOptions } from "@/lib/cvs";
import { createCv } from "../actions";
import { CvForm } from "../cv-form";

export default async function NewCvPage() {
  const userId = await requireUserId();
  const { experienceOptions, competenceOptions, formationOptions } = await listCvOptions(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/cv"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour
      </Link>
      <h2 className="mb-8 mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Nouveau CV
      </h2>
      <CvForm
        action={createCv}
        submitLabel="Créer"
        experienceOptions={experienceOptions}
        competenceOptions={competenceOptions}
        formationOptions={formationOptions}
      />
    </div>
  );
}
