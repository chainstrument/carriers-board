import Link from "next/link";
import { requireUserId } from "@/lib/auth-helpers";
import { listCvs } from "@/lib/cvs";

export default async function CvListPage() {
  const userId = await requireUserId();
  const items = await listCvs(userId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          CV
        </h2>
        <Link
          href="/cv/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          + Nouveau CV
        </Link>
      </div>

      {items.length === 0 && (
        <p className="text-neutral-500">
          Aucun CV pour l&apos;instant.{" "}
          <Link href="/cv/new" className="underline">
            Crée le premier
          </Link>
          .
        </p>
      )}

      <div className="space-y-2">
        {items.map((cv) => (
          <Link
            key={cv.id}
            href={`/cv/${cv.id}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {cv.name}
              </span>
              <p className="text-xs text-neutral-500">{cv.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
