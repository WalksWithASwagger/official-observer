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
}: {
  dataset: Dataset;
  onSelect: (id: string) => void;
}) {
  const [active, setActive] = useState<StoryId | null>(null);
  const [step, setStep] = useState(0);

  const story = STORIES.find((s) => s.id === active);
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

  const go = (s: (typeof playable)[0], i: number) => {
    setActive(s.id);
    setStep(i);
    onSelect(s.steps[i].entityId);
  };

  return (
    <div className="absolute right-4 top-16 z-20 max-w-[min(18rem,calc(100vw-2rem))] max-sm:hidden">
      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-2 shadow-xl backdrop-blur-md">
        <div className="mb-1 px-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
          Stories
        </div>
        <div className="flex flex-wrap gap-1">
          {playable.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s, 0)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                active === s.id
                  ? "bg-sky-500/20 text-sky-100"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {story && story.steps.length > 0 && ids.has(story.steps[0]?.entityId) && (
          <div className="mt-2 border-t border-white/5 px-1 pt-2">
            <p className="text-xs text-slate-400">
              {step + 1}/{story.steps.filter((st) => ids.has(st.entityId)).length}:{" "}
              {story.steps.filter((st) => ids.has(st.entityId))[step]?.note}
            </p>
            <div className="mt-1.5 flex gap-1">
              <button
                disabled={step <= 0}
                onClick={() => {
                  const steps = story.steps.filter((st) => ids.has(st.entityId));
                  const n = Math.max(0, step - 1);
                  setStep(n);
                  onSelect(steps[n].entityId);
                }}
                className="rounded-full px-2 py-0.5 text-xs text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                ←
              </button>
              <button
                onClick={() => {
                  const steps = story.steps.filter((st) => ids.has(st.entityId));
                  const n = Math.min(steps.length - 1, step + 1);
                  setStep(n);
                  onSelect(steps[n].entityId);
                }}
                className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-200 hover:bg-sky-500/25"
              >
                Next →
              </button>
              <button
                onClick={() => setActive(null)}
                className="ml-auto rounded-full px-2 py-0.5 text-xs text-slate-500 hover:text-slate-300"
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
