"use client";

import {
  ENTITY_TYPE_LABELS,
  INITIATIVES,
  type EntityType,
  type Initiative,
} from "@/lib/types";

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
        active
          ? "border-[var(--line-strong)] bg-white/10 text-[var(--foreground)]"
          : "border-transparent bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
      style={active && color ? { color, borderColor: `${color}66` } : undefined}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  availableTypes,
  hiddenTypes,
  hiddenInitiatives,
  onToggleType,
  onToggleInitiative,
  embedded = false,
}: {
  availableTypes: EntityType[];
  hiddenTypes: Set<EntityType>;
  hiddenInitiatives: Set<Initiative>;
  onToggleType: (t: EntityType) => void;
  onToggleInitiative: (i: Initiative) => void;
  embedded?: boolean;
}) {
  return (
    <div
      className={
        embedded
          ? "flex flex-col gap-2"
          : "absolute left-4 top-32 z-20 flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xl backdrop-blur-md sm:top-[4.75rem]"
      }
    >
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Initiative
        </span>
        {INITIATIVES.map((i) => (
          <Chip
            key={i.id}
            active={!hiddenInitiatives.has(i.id)}
            color={i.color}
            onClick={() => onToggleInitiative(i.id)}
          >
            {i.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Type
        </span>
        {availableTypes.map((t) => (
          <Chip
            key={t}
            active={!hiddenTypes.has(t)}
            onClick={() => onToggleType(t)}
          >
            {ENTITY_TYPE_LABELS[t]}
          </Chip>
        ))}
      </div>
    </div>
  );
}
