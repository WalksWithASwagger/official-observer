"use client";

import { useMemo, useState } from "react";
import MiniSearch from "minisearch";
import { ENTITY_TYPE_LABELS, type Entity } from "@/lib/types";

export function SearchBox({
  entities,
  onSelect,
  embedded = false,
}: {
  entities: Entity[];
  onSelect: (id: string) => void;
  /** When true, sits inside the command rail (no absolute positioning). */
  embedded?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const index = useMemo(() => {
    const mini = new MiniSearch({
      fields: ["name", "blurb", "tags"],
      storeFields: ["name", "type"],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { name: 2 } },
    });
    mini.addAll(
      entities.map((e) => ({
        id: e.id,
        name: e.name,
        blurb: e.blurb,
        tags: (e.tags ?? []).join(" "),
        type: e.type,
      })),
    );
    return mini;
  }, [entities]);

  const results = useMemo(
    () => (query.trim() ? index.search(query).slice(0, 8) : []),
    [query, index],
  );

  return (
    <div className={embedded ? "relative w-full" : "absolute left-1/2 top-20 z-20 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 sm:top-4"}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search the ecosystem…"
        aria-label="Search the ecosystem"
        type="search"
        className="w-full rounded-md border border-[var(--line)] bg-black/30 px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[color-mix(in_srgb,var(--bc-ai)_55%,transparent)]"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-[var(--line)] bg-[var(--ink-elevated)] shadow-2xl">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onMouseDown={() => {
                  onSelect(r.id);
                  setQuery(r.name as string);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-white/8"
              >
                <span>{r.name as string}</span>
                <span className="text-xs text-[var(--muted)]">
                  {ENTITY_TYPE_LABELS[r.type as keyof typeof ENTITY_TYPE_LABELS]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
