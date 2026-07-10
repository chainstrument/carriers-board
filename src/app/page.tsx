import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "./logout/actions";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          CareerBoard
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/profile" className="text-neutral-600 hover:underline dark:text-neutral-400">
            {session?.user?.name ?? session?.user?.email}
          </Link>
          <Link href="/settings" className="text-neutral-600 hover:underline dark:text-neutral-400">
            Paramètres
          </Link>
          <form action={logout}>
            <button type="submit" className="text-neutral-600 hover:underline dark:text-neutral-400">
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h2>
        <p className="mt-2 text-neutral-500">
          Espace personnel connecté. Les widgets (poste actuel, package, satisfaction,
          objectifs...) arriveront avec les prochains epics.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/experiences"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mon parcours professionnel →
          </Link>
          <Link
            href="/competences"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mes compétences →
          </Link>
          <Link
            href="/journal"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir mon journal →
          </Link>
          <Link
            href="/satisfaction"
            className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Voir ma satisfaction →
          </Link>
        </div>
      </main>
    </div>
  );
}
