"use client";

import dynamic from "next/dynamic";

const Observatory = dynamic(() => import("@/components/Observatory"), {
  ssr: false,
  loading: () => (
    <div className="observatory-bg flex h-dvh w-full items-center justify-center px-6 text-slate-200">
      <div className="max-w-xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          official.observer
        </p>
        <h1 className="font-display mt-2 text-4xl font-medium text-slate-50 sm:text-5xl">
          The Observatory
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          A public, interactive living map of the BC + AI, ED + AI, and
          Futureproof ecosystem.
        </p>
        <nav
          aria-label="Observatory resources"
          className="mt-6 flex flex-wrap justify-center gap-4 text-sm"
        >
          <a href="/about" className="text-sky-400 hover:underline">
            About the Observatory
          </a>
          <a href="/api/v1/graph" className="text-sky-400 hover:underline">
            Download the public graph
          </a>
        </nav>
        <p aria-live="polite" className="mt-8 text-sm text-slate-500">
          Loading the interactive ecosystem map…
        </p>
      </div>
    </div>
  ),
});

export default function ObservatoryClient({ embed = false }: { embed?: boolean }) {
  return <Observatory embed={embed} />;
}
