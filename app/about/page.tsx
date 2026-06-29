import Link from "next/link";
import { dataset } from "@/lib/data";
import { INITIATIVES } from "@/lib/types";

export const metadata = {
  title: "About — The Observatory",
};

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-slate-200">
      <Link href="/" className="text-sm text-sky-400 hover:underline">
        ← Back to the map
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">The Observatory</h1>
      <p className="mt-4 text-slate-300">
        A public, interactive living map of the people, organizations, projects,
        and events across three connected initiatives:
      </p>

      <ul className="mt-4 space-y-2">
        {INITIATIVES.map((i) => (
          <li key={i.id} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: i.color }}
            />
            <span className="font-medium">{i.label}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">How it works</h2>
      <p className="mt-3 text-slate-300">
        Every node and edge comes from version-controlled JSON in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">/data</code>.
        There is no database — the graph is built in your browser from open data.
        It currently maps {dataset.entities.length} entities and{" "}
        {dataset.relationships.length} relationships.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Open data</h2>
      <p className="mt-3 text-slate-300">
        The code is MIT licensed; the dataset in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">/data</code>{" "}
        is published under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          className="text-sky-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0
        </a>
        . Contributions — corrections, new entities, new connections — are
        welcome via pull request.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Embed this map</h2>
      <p className="mt-3 text-slate-300">
        Drop the live graph into your own site with an iframe:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-white/5 p-3 text-xs text-slate-300">
        {`<iframe
  src="https://official.observer/embed"
  width="100%" height="600"
  style="border:0;border-radius:12px"
  title="The Observatory"
  loading="lazy"
></iframe>`}
      </pre>
    </main>
  );
}
