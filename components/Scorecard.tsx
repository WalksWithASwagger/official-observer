import { ecosystemStats } from "@/lib/stats";

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      <span className="text-lg font-semibold tabular-nums text-sky-400">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-white/10" />;
}

export function Scorecard({ className }: { className?: string }) {
  const stats = ecosystemStats();

  const cards: { value: number; label: string }[] = [
    { value: stats.totalEntities, label: "entities" },
    { value: stats.totalRelationships, label: "connections" },
    { value: stats.orgs, label: "orgs" },
    { value: stats.projects, label: "projects" },
    { value: stats.chapters, label: "chapters" },
    { value: stats.partners, label: "partners" },
  ];

  return (
    <div
      className={[
        "flex items-stretch divide-x divide-white/10 rounded-xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cards.map((c, i) => (
        <div key={c.label} className="flex">
          {i > 0 && <Divider />}
          <StatCard value={c.value} label={c.label} />
        </div>
      ))}
    </div>
  );
}
