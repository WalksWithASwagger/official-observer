"use client";

import {
  ENTITY_TYPE_COLORS,
  ENTITY_TYPE_LABELS,
  INITIATIVES,
  type Dataset,
  type Relationship,
} from "@/lib/types";

function connectionsFor(
  dataset: Dataset,
  id: string,
): { rel: Relationship; otherId: string }[] {
  return dataset.relationships
    .filter((r) => r.source === id || r.target === id)
    .map((r) => ({ rel: r, otherId: r.source === id ? r.target : r.source }));
}

export function EntityPanel({
  dataset,
  selectedId,
  onSelect,
  onClose,
}: {
  dataset: Dataset;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  if (!selectedId) return null;
  const entity = dataset.entities.find((e) => e.id === selectedId);
  if (!entity) return null;

  const connections = connectionsFor(dataset, entity.id);

  return (
    <aside className="obs-surface-solid obs-panel-in absolute inset-x-2 bottom-2 z-30 flex max-h-[58vh] flex-col overflow-hidden rounded-[var(--radius-panel)] text-[var(--foreground)] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-[4.75rem] sm:max-h-[calc(100%-6.5rem)] sm:w-[20rem]">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] p-4">
        <div>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: ENTITY_TYPE_COLORS[entity.type] }}
          >
            {ENTITY_TYPE_LABELS[entity.type]}
          </span>
          <h2 className="font-display mt-0.5 text-xl font-medium leading-tight tracking-tight">
            {entity.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto p-4 text-sm">
        <p className="leading-relaxed text-[var(--muted)]">{entity.blurb}</p>

        {entity.joinUrl && (
          <a
            href={entity.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--bc-ai)_18%,transparent)] px-3 py-1.5 text-sm font-medium text-[var(--bc-ai)] transition hover:bg-[color-mix(in_srgb,var(--bc-ai)_28%,transparent)]"
          >
            Get involved →
          </a>
        )}

        <a
          href={`/e/${entity.id}`}
          className="mt-2 block text-xs text-[var(--muted)] hover:text-[var(--bc-ai)]"
        >
          Permalink / share page ↗
        </a>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {entity.initiatives.map((id) => {
            const init = INITIATIVES.find((i) => i.id === id);
            if (!init) return null;
            return (
              <span
                key={id}
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${init.color}22`, color: init.color }}
              >
                {init.label}
              </span>
            );
          })}
        </div>

        {entity.nextDate && (
          <p className="mt-3 font-mono text-xs text-[var(--futureproof)]">
            Next: {entity.nextDate}
          </p>
        )}

        {entity.links && entity.links.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Links
            </h3>
            <ul className="space-y-1">
              {entity.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--bc-ai)] hover:underline"
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
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Connections ({connections.length})
            </h3>
            <ul className="space-y-1">
              {connections.map(({ rel, otherId }) => {
                const other = dataset.entities.find((e) => e.id === otherId);
                if (!other) return null;
                return (
                  <li key={`${rel.source}-${rel.target}-${rel.type}`}>
                    <button
                      type="button"
                      onClick={() => onSelect(otherId)}
                      className="w-full text-left text-[var(--foreground)]/85 hover:text-[var(--foreground)]"
                    >
                      <span className="text-[var(--muted)]">{rel.type} →</span>{" "}
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
