"use client";

import { useTransition } from "react";
import { moveStatus } from "./actions";
import { STATUS_OPTIONS } from "@/lib/job-board";

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

export function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as StatusValue;
        startTransition(() => {
          moveStatus(applicationId, value);
        });
      }}
      className="w-full rounded-md border border-neutral-200 bg-transparent px-2 py-1 text-xs text-neutral-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400"
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
