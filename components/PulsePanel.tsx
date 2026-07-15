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
  hasSelection = false,
}: {
  dataset: Dataset;
  onSelect: (id: string) => void;
  /** When an entity sheet is open on mobile, lift the dock above it. */
  hasSelection?: boolean;
}) {
  const upcoming = useMemo(
    () => upcomingEvents(dataset).slice(0, 4),
    [dataset],
  );
  const festDate = useMemo(() => futureproofDate(dataset), [dataset]);
  const countdown = useMemo(() => daysUntil(festDate), [festDate]);
  const festivalMode =
    countdown > 0 ? "pre" : countdown >= -3 ? "during" : "post";

  return (
    <aside
      className={[
        "obs-surface absolute z-20 obs-animate-in",
        // Mobile: slim dock; lift when selection sheet open
        hasSelection
          ? "inset-x-2 bottom-[min(62vh,28rem)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-64"
          : "inset-x-2 bottom-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-64",
        "rounded-[var(--radius-panel)] p-2 sm:p-3",
      ].join(" ")}
    >
      {/* Mobile compact row */}
      <div className="flex gap-2 overflow-x-auto sm:hidden">
        {festivalMode === "pre" && (
          <a
            href="https://futureproof.website"
            target="_blank"
            rel="noopener noreferrer"
            className="obs-countdown-tick shrink-0 rounded-md bg-[color-mix(in_srgb,var(--futureproof)_18%,transparent)] px-2 py-1 text-xs font-medium text-[var(--futureproof)]"
          >
            {countdown}d to Futureproof
          </a>
        )}
        {festivalMode === "during" && (
          <span className="shrink-0 rounded-md bg-[color-mix(in_srgb,var(--futureproof)_18%,transparent)] px-2 py-1 text-xs text-[var(--futureproof)]">
            Futureproof is live
          </span>
        )}
        {festivalMode === "post" && (
          <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs text-[var(--muted)]">
            Futureproof 2026 — recap
          </span>
        )}
        {upcoming.length === 0 ? (
          <span className="px-2 py-1 text-xs text-[var(--muted)]">
            No upcoming Public events
          </span>
        ) : (
          upcoming.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e.entityId)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-[var(--foreground)]/85 hover:bg-white/10"
            >
              <span className="text-[var(--bc-ai)]">{formatDate(e.date)}</span>{" "}
              {e.name}
            </button>
          ))
        )}
      </div>

      {/* Desktop dock */}
      <div className="hidden sm:block">
        {festivalMode === "pre" && (
          <a
            href="https://futureproof.website"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 block rounded-md bg-[color-mix(in_srgb,var(--futureproof)_12%,transparent)] px-3 py-2 transition hover:bg-[color-mix(in_srgb,var(--futureproof)_20%,transparent)]"
          >
            <div className="font-display obs-countdown-tick text-3xl tabular-nums leading-none text-[var(--futureproof)]">
              {countdown}
              <span className="ml-1.5 align-middle text-xs font-normal uppercase tracking-[0.14em] text-[var(--futureproof)]/75">
                days
              </span>
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              to Futureproof Festival
            </div>
          </a>
        )}
        {festivalMode === "during" && (
          <div className="mb-3 rounded-md bg-[color-mix(in_srgb,var(--futureproof)_15%,transparent)] px-3 py-2 text-sm text-[var(--futureproof)]">
            Futureproof is live — explore the festival neighborhood.
          </div>
        )}
        {festivalMode === "post" && (
          <div className="mb-3 rounded-md bg-white/5 px-3 py-2 text-sm text-[var(--muted)]">
            Futureproof 2026 has passed. The archive graph remains.
          </div>
        )}

        <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          What&apos;s next
        </div>
        {upcoming.length === 0 ? (
          <p className="px-1 text-sm text-[var(--muted)]">
            No upcoming Public events yet.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {upcoming.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e.entityId)}
                  className="flex w-full items-baseline gap-2 rounded-md px-1 py-1 text-left text-sm text-[var(--foreground)]/85 hover:bg-white/5 hover:text-[var(--foreground)]"
                >
                  <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-[var(--bc-ai)]">
                    {formatDate(e.date)}
                  </span>
                  <span className="truncate">{e.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
