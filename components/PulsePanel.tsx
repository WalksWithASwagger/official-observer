"use client";

import { useMemo } from "react";
import { upcomingEvents, daysUntil, FUTUREPROOF_DATE } from "@/lib/events";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function PulsePanel({ onSelect }: { onSelect: (id: string) => void }) {
  const upcoming = useMemo(() => upcomingEvents().slice(0, 4), []);
  const countdown = useMemo(() => daysUntil(FUTUREPROOF_DATE), []);

  return (
    <aside className="absolute bottom-4 right-4 z-10 w-64 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-slate-100 shadow-xl backdrop-blur max-sm:hidden">
      {countdown >= 0 && (
        <a
          href="https://futureproof.website"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 block rounded-lg bg-amber-500/10 px-3 py-2 transition hover:bg-amber-500/20"
        >
          <div className="text-2xl font-semibold tabular-nums text-amber-400">
            {countdown}
            <span className="ml-1 text-xs font-normal uppercase tracking-wider text-amber-300/80">
              days
            </span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400">
            to Futureproof Festival
          </div>
        </a>
      )}

      <div className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
        What&apos;s next
      </div>
      <ul className="space-y-1">
        {upcoming.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => onSelect(e.entityId)}
              className="flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <span className="w-12 shrink-0 text-xs tabular-nums text-sky-400">
                {formatDate(e.date)}
              </span>
              <span className="truncate">{e.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
