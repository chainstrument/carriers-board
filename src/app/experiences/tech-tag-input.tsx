"use client";

import { useState } from "react";

export function TechTagInput({ defaultTags = [] }: { defaultTags?: string[] }) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [draft, setDraft] = useState("");

  function addTag(value: string) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor="tech-input" className="text-sm text-neutral-600 dark:text-neutral-400">
        Technologies
      </label>
      <div className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              aria-label={`Retirer ${tag}`}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="tech-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder="PHP, Symfony, Docker..."
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <input type="hidden" name="technologies" value={tags.join(",")} />
    </div>
  );
}
