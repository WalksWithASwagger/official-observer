"use client";

import { entityById } from "@/lib/data";
import {
  ENTITY_TYPE_LABELS,
  INITIATIVES,
  type Relationship,
} from "@/lib/types";
import { dataset } from "@/lib/data";

function connectionsFor(id: string): { rel: Relationship; otherId: string }[] {
  return dataset.relationships
    .filter((r) => r.source === id || r.target === id)
    .map((r) => ({ rel: r, otherId: r.source === id ? r.target : r.source }));
}

export function EntityPanel({
  selectedId,
  onSelect,
  onClose,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  if (!selectedId) return null;
  const entity = entityById.get(selectedId);
  if (!entity) return null;

  const connections = connectionsFor(entity.id);

  return (
    <aside className="absolute inset-x-2 bottom-2 z-30 flex max-h-[60vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-80">
      <div className="flex items-start justify-between gap-2 border-b border-white/10 p-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400">
            {ENTITY_TYPE_LABELS[entity.type]}
          </span>
          <h2 className="text-lg font-semibold leading-tight">{entity.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto p-4 text-sm">
        <p className="text-slate-300">{entity.blurb}</p>

        {entity.joinUrl && (
          <a
            href={entity.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-sky-500/15 px-3 py-1.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/25"
          >
            Get involved →
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {entity.initiatives.map((id) => {
            const init = INITIATIVES.find((i) => i.id === id);
            if (!init) return null;
            return (
              <span
                key={id}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${init.color}22`, color: init.color }}
              >
                {init.label}
              </span>
            );
          })}
        </div>

        {entity.links && entity.links.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Links
            </h3>
            <ul className="space-y-1">
              {entity.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {connections.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Connections ({connections.length})
            </h3>
            <ul className="space-y-1">
              {connections.map(({ rel, otherId }) => {
                const other = entityById.get(otherId);
                if (!other) return null;
                return (
                  <li key={`${rel.source}-${rel.target}-${rel.type}`}>
                    <button
                      onClick={() => onSelect(otherId)}
                      className="w-full text-left text-slate-300 hover:text-white"
                    >
                      <span className="text-slate-500">{rel.type} →</span>{" "}
                      {other.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
