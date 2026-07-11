import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userLabel = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="flex min-h-screen">
      <Sidebar userLabel={userLabel} />
      <main className="min-w-0 flex-1 bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    </div>
  );
}
