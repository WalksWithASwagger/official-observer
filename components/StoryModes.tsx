"use client";

import { useMemo, useState } from "react";
import type { Dataset, Initiative } from "@/lib/types";
import { INITIATIVES } from "@/lib/types";

export type StoryId = "bc-ai" | "ed-ai" | "futureproof";

const STORIES: {
  id: StoryId;
  label: string;
  steps: { entityId: string; note: string }[];
}[] = [
  {
    id: "bc-ai",
    label: "What is BC + AI",
    steps: [
      { entityId: "initiative-bc-ai", note: "The ecosystem initiative" },
      { entityId: "org-bc-ai-ecosystem-association", note: "The nonprofit steward" },
      { entityId: "event-vancouver-ai-meetup", note: "The flagship monthly meetup" },
      { entityId: "event-bc-ai-office-hours", note: "Weekly peer support" },
    ],
  },
  {
    id: "ed-ai",
    label: "ED + AI path",
    steps: [
      { entityId: "initiative-ed-ai", note: "Education + AI" },
      { entityId: "event-ai-in-education-meetup", note: "Classroom community" },
      { entityId: "project-responsible-ai-professional-program", note: "Practitioner training" },
    ],
  },
  {
    id: "futureproof",
    label: "Road to Futureproof",
    steps: [
      { entityId: "initiative-futureproof", note: "The ideas festival" },
      { entityId: "event-futureproof-festival-2026", note: "Oct 28–30 2026" },
      { entityId: "org-h-r-macmillan-space-centre", note: "Host venue" },
    ],
  },
];

export function StoryModes({
  dataset,
  onSelect,
  onClose,
}: {
  dataset: Dataset;
  onSelect: (id: string) => void;
  onClose?: () => void;
}) {
  const [active, setActive] = useState<StoryId | null>(null);
  const [step, setStep] = useState(0);

  const ids = useMemo(() => new Set(dataset.entities.map((e) => e.id)), [dataset]);

  const playable = useMemo(
    () =>
      STORIES.map((s) => ({
        ...s,
        steps: s.steps.filter((st) => ids.has(st.entityId)),
      })).filter((s) => s.steps.length >= 2),
    [ids],
  );

  if (playable.length === 0) return null;

  const story = playable.find((s) => s.id === active);
  const steps = story?.steps ?? [];

  const go = (s: (typeof playable)[0], i: number) => {
    setActive(s.id);
    setStep(i);
    onSelect(s.steps[i].entityId);
  };

  return (
    <div className="absolute inset-x-3 bottom-24 z-40 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-24 sm:w-[min(22rem,calc(100vw-2rem))] sm:-translate-x-1/2">
      <div className="obs-surface-solid obs-animate-in rounded-[var(--radius-panel)] p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Guided tours
            </div>
            <h2 className="font-display text-xl tracking-tight text-[var(--foreground)]">
              Walk the constellation
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tours"
              className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {playable.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s, 0)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                active === s.id
                  ? "bg-[color-mix(in_srgb,var(--bc-ai)_22%,transparent)] text-[var(--bc-ai)]"
                  : "bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {story && steps.length > 0 && (
          <div className="mt-3 border-t border-[var(--line)] pt-3">
            <p
              key={`${story.id}-${step}`}
              className="obs-animate-in text-sm text-[var(--foreground)]/90"
            >
              <span className="tabular-nums text-[var(--muted)]">
                {step + 1}/{steps.length}
              </span>
              {" — "}
              {steps[step]?.note}
            </p>
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                disabled={step <= 0}
                onClick={() => {
                  const n = Math.max(0, step - 1);
                  setStep(n);
                  onSelect(steps[n].entityId);
                }}
                className="rounded-md px-2.5 py-1 text-xs text-[var(--muted)] hover:bg-white/5 disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = Math.min(steps.length - 1, step + 1);
                  setStep(n);
                  onSelect(steps[n].entityId);
                }}
                className="rounded-md bg-[color-mix(in_srgb,var(--bc-ai)_20%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--bc-ai)] hover:bg-[color-mix(in_srgb,var(--bc-ai)_30%,transparent)]"
              >
                Next →
              </button>
              <button
                type="button"
                onClick={() => {
                  setActive(null);
                  onClose?.();
                }}
                className="ml-auto rounded-md px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                End
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function initiativeFromParam(raw: string | null): Initiative | null {
  if (!raw) return null;
  return INITIATIVES.some((i) => i.id === raw) ? (raw as Initiative) : null;
}
