import ObservatoryClient from "@/components/ObservatoryClient";

export const metadata = {
  title: "The Observatory — embed",
};

export default function EmbedPage() {
  return (
    <div className="observatory-bg relative h-dvh w-full overflow-hidden">
      <ObservatoryClient embed />
      <a
        href="https://official.observer"
        target="_blank"
        rel="noopener noreferrer"
        className="obs-surface absolute bottom-3 right-3 z-20 rounded-full px-3 py-1 text-xs font-medium text-[var(--bc-ai)] shadow-lg hover:border-[var(--line-strong)]"
      >
        The Observatory ↗
      </a>
    </div>
  );
}
