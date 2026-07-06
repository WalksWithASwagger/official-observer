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
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-transparent bg-white/5 text-slate-500 hover:text-slate-300"
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
}: {
  availableTypes: EntityType[];
  hiddenTypes: Set<EntityType>;
  hiddenInitiatives: Set<Initiative>;
  onToggleType: (t: EntityType) => void;
  onToggleInitiative: (i: Initiative) => void;
}) {
  return (
    <div className="absolute left-4 top-32 z-20 flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/75 p-3 text-slate-100 shadow-xl backdrop-blur-md sm:top-[4.75rem]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
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
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
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
