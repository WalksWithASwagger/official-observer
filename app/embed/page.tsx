import ObservatoryClient from "@/components/ObservatoryClient";

export const metadata = {
  title: "The Observatory — embed",
};

export default function EmbedPage() {
  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-950">
      <ObservatoryClient embed />
    </div>
  );
}
