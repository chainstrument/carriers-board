import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth-helpers";
import { buildCvData, cvDownloadFilename, getCvWithSelections } from "@/lib/cvs";
import { CvPreview } from "./cv-preview";

export default async function CvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const [cv, data] = await Promise.all([
    getCvWithSelections(userId, id),
    buildCvData(userId, id),
  ]);
  if (!cv || !data) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Link
        href="/cv"
        className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Retour aux CV
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {cv.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{cv.title}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/cv/${cv.id}/download`}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Télécharger ({cvDownloadFilename(cv.name)})
          </a>
          <Link
            href={`/cv/${cv.id}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Modifier
          </Link>
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        Aperçu — la mise en page ci-dessous reflète le template choisi, le
        fichier téléchargé peut différer légèrement dans le détail.
      </p>

      <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <CvPreview data={data} />
      </div>
    </div>
  );
}
