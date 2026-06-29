import ObservatoryClient from "@/components/ObservatoryClient";

export const metadata = {
  title: "The Observatory — embed",
};

export default function EmbedPage() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <ObservatoryClient embed />
      <a
        href="https://official.observer"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-20 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-sky-300 shadow-lg backdrop-blur hover:bg-slate-800/80"
      >
        The Observatory ↗
      </a>
    </div>
  );
}
