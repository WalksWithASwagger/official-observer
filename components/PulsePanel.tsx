"use client";

import { useMemo } from "react";
import {
  upcomingEvents,
  daysUntil,
  futureproofDate,
} from "@/lib/events";
import type { Dataset } from "@/lib/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function PulsePanel({
  dataset,
  onSelect,
  compact = false,
}: {
  dataset: Dataset;
  onSelect: (id: string) => void;
  /** Show on mobile as a slim strip */
  compact?: boolean;
}) {
  const upcoming = useMemo(
    () => upcomingEvents(dataset).slice(0, 4),
    [dataset],
  );
  const festDate = useMemo(() => futureproofDate(dataset), [dataset]);
  const countdown = useMemo(() => daysUntil(festDate), [festDate]);
  const festivalMode =
    countdown > 0 ? "pre" : countdown >= -3 ? "during" : "post";

  if (compact) {
    return (
      <aside className="absolute inset-x-2 bottom-[calc(60vh+0.5rem)] z-20 sm:hidden">
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-slate-900/90 px-2 py-1.5 text-xs backdrop-blur">
          {festivalMode === "pre" && (
            <a
              href="https://futureproof.website"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-amber-500/15 px-2 py-1 font-medium text-amber-300"
            >
              {countdown}d to Futureproof
            </a>
          )}
          {festivalMode === "post" && (
            <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-slate-400">
              Futureproof 2026 — recap
            </span>
          )}
          {upcoming.length === 0 ? (
            <span className="px-2 py-1 text-slate-500">No upcoming Public events</span>
          ) : (
            upcoming.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelect(e.entityId)}
                className="shrink-0 rounded-lg px-2 py-1 text-slate-300 hover:bg-white/10"
              >
                <span className="text-sky-400">{formatDate(e.date)}</span> {e.name}
              </button>
            ))
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="absolute bottom-4 right-4 z-10 w-64 rounded-2xl border border-white/10 bg-slate-900/75 p-3 text-slate-100 shadow-xl backdrop-blur-md max-sm:hidden">
      {festivalMode === "pre" && (
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
      {festivalMode === "during" && (
        <div className="mb-3 rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-200">
          Futureproof is live — explore the festival neighborhood on the map.
        </div>
      )}
      {festivalMode === "post" && (
        <div className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300">
          Futureproof 2026 has passed. Explore the archive graph — stories continue.
        </div>
      )}

      <div className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
        What&apos;s next
      </div>
      {upcoming.length === 0 ? (
        <p className="px-1 text-sm text-slate-500">No upcoming Public events yet.</p>
      ) : (
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
      )}
    </aside>
  );
}
