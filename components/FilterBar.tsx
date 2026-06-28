"use client";

import {
  ENTITY_TYPES,
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-transparent bg-white/5 text-slate-400 hover:text-slate-200"
      }`}
      style={active && color ? { color, borderColor: `${color}66` } : undefined}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  types,
  initiatives,
  onToggleType,
  onToggleInitiative,
}: {
  types: Set<EntityType>;
  initiatives: Set<Initiative>;
  onToggleType: (t: EntityType) => void;
  onToggleInitiative: (i: Initiative) => void;
}) {
  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-slate-100 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs uppercase tracking-wider text-slate-500">
          Initiative
        </span>
        {INITIATIVES.map((i) => (
          <Chip
            key={i.id}
            active={initiatives.has(i.id)}
            color={i.color}
            onClick={() => onToggleInitiative(i.id)}
          >
            {i.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs uppercase tracking-wider text-slate-500">
          Type
        </span>
        {ENTITY_TYPES.map((t) => (
          <Chip key={t} active={types.has(t)} onClick={() => onToggleType(t)}>
            {ENTITY_TYPE_LABELS[t]}
          </Chip>
        ))}
      </div>
    </div>
  );
}
