"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/logout/actions";

const NAV_SECTIONS = [
  {
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/import-cv", label: "Importer un CV" },
    ],
  },
  {
    title: "Carrière",
    items: [
      { href: "/experiences", label: "Parcours" },
      { href: "/package", label: "Package" },
      { href: "/competences", label: "Compétences" },
      { href: "/journal", label: "Journal" },
      { href: "/satisfaction", label: "Satisfaction" },
    ],
  },
  {
    title: "Pilotage",
    items: [
      { href: "/objectifs", label: "Objectifs" },
      { href: "/projets", label: "Projets" },
      { href: "/formation", label: "Formation" },
    ],
  },
  {
    title: "Recherche d'emploi",
    items: [{ href: "/candidatures", label: "Candidatures" }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
        <Link
          href="/"
          className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          CareerBoard
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title ?? i}>
            {section.title && (
              <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-2 py-1.5 text-sm ${
                    isActive(pathname, item.href)
                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-neutral-200 px-3 py-4 dark:border-neutral-800">
        <Link
          href="/profile"
          className={`block truncate rounded-md px-2 py-1.5 text-sm ${
            isActive(pathname, "/profile")
              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
          }`}
          title={userLabel}
        >
          {userLabel}
        </Link>
        <Link
          href="/settings"
          className={`block rounded-md px-2 py-1.5 text-sm ${
            isActive(pathname, "/settings")
              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
          }`}
        >
          Paramètres
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
