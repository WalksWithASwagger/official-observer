"use client";

import { useMemo, useState } from "react";
import MiniSearch from "minisearch";
import { ENTITY_TYPE_LABELS, type Entity } from "@/lib/types";

export function SearchBox({
  entities,
  onSelect,
}: {
  entities: Entity[];
  onSelect: (id: string) => void;
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
    <div className="absolute left-1/2 top-20 z-20 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 sm:top-4">
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
        className="w-full rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 shadow-xl outline-none backdrop-blur placeholder:text-slate-500 focus:border-sky-500/50"
      />
      {open && results.length > 0 && (
        <ul className="absolute mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onMouseDown={() => {
                  onSelect(r.id);
                  setQuery(r.name as string);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
              >
                <span>{r.name as string}</span>
                <span className="text-xs text-slate-500">
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
