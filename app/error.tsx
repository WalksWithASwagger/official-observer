"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex h-dvh w-full items-center justify-center bg-slate-950 p-6">
      <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center text-slate-100 shadow-xl backdrop-blur">
        <h1 className="text-base font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-400">
          The Observatory hit an unexpected error. Reloading usually fixes it.
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-full border border-sky-500/40 bg-sky-500/15 px-4 py-1.5 text-sm font-medium text-sky-200 transition hover:bg-sky-500/25"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
