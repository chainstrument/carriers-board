import { ImportForm } from "./import-form";

export default function ImportCvPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Importer un CV
      </h2>
      <p className="mb-8 text-sm text-neutral-500">
        Dépose ton CV en PDF pour pré-remplir tes compétences et retrouver
        rapidement tes périodes d&apos;expérience.
      </p>
      <ImportForm />
    </div>
  );
}
