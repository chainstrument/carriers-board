import Link from "next/link";

export function WidgetCard({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  const className =
    "block h-full rounded-lg border border-neutral-200 p-4 dark:border-neutral-800" +
    (href
      ? " transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
      : "");

  const inner = (
    <>
      <h3 className="mb-3 text-sm font-medium text-neutral-500">{title}</h3>
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
