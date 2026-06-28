"use client";

import dynamic from "next/dynamic";

const Observatory = dynamic(() => import("@/components/Observatory"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">
      Loading the ecosystem…
    </div>
  ),
});

export default function ObservatoryClient() {
  return <Observatory />;
}
