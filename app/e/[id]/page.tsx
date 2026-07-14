import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dataset } from "@/lib/data";
import { hasDb, getGraph } from "@/lib/db";
import {
  ENTITY_TYPE_LABELS,
  INITIATIVES,
  type Entity,
  type Dataset,
} from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadDataset(): Promise<Dataset> {
  if (hasDb()) {
    try {
      const g = await getGraph();
      if (g.entities.length) return g;
    } catch {
      /* fall through */
    }
  }
  return dataset;
}

function connectionsFor(data: Dataset, id: string) {
  return data.relationships
    .filter((r) => r.source === id || r.target === id)
    .map((r) => ({
      rel: r,
      otherId: r.source === id ? r.target : r.source,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadDataset();
  const entity = data.entities.find((e) => e.id === id);
  if (!entity) return { title: "Not found — The Observatory" };
  return {
    title: `${entity.name} — The Observatory`,
    description: entity.blurb,
    openGraph: {
      title: entity.name,
      description: entity.blurb,
      url: `https://official.observer/e/${entity.id}`,
    },
  };
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDataset();
  const byId = new Map(data.entities.map((e) => [e.id, e]));
  const entity = byId.get(id);
  if (!entity) notFound();

  const connections = connectionsFor(data, entity.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-slate-200">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href={`/?node=${entity.id}`} className="text-sky-400 hover:underline">
          ← Open on map
        </Link>
        <Link href="/about" className="text-slate-500 hover:text-slate-300">
          About
        </Link>
        <a
          href="/api/v1/graph"
          className="text-slate-500 hover:text-slate-300"
        >
          Download JSON
        </a>
      </div>

      <p className="mt-8 text-xs uppercase tracking-wider text-slate-500">
        {ENTITY_TYPE_LABELS[entity.type]}
      </p>
      <h1 className="mt-1 text-3xl font-semibold text-slate-50">{entity.name}</h1>
      <p className="mt-4 text-slate-300">{entity.blurb}</p>

      {entity.joinUrl && (
        <a
          href={entity.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-sky-500/15 px-3 py-1.5 text-sm font-medium text-sky-300 hover:bg-sky-500/25"
        >
          Get involved →
        </a>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {entity.initiatives.map((iid) => {
          const init = INITIATIVES.find((i) => i.id === iid);
          if (!init) return null;
          return (
            <span
              key={iid}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${init.color}22`, color: init.color }}
            >
              {init.label}
            </span>
          );
        })}
        {entity.region && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
            {entity.region}
          </span>
        )}
        {entity.nextDate && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
            Next: {entity.nextDate}
          </span>
        )}
      </div>

      {entity.links && entity.links.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Links
          </h2>
          <ul className="mt-2 space-y-1">
            {entity.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {connections.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Connections ({connections.length})
          </h2>
          <ul className="mt-2 space-y-1">
            {connections.map(({ rel, otherId }) => {
              const other = byId.get(otherId) as Entity | undefined;
              if (!other) return null;
              return (
                <li key={`${rel.source}-${rel.target}-${rel.type}`}>
                  <Link
                    href={`/e/${other.id}`}
                    className="text-slate-300 hover:text-white"
                  >
                    <span className="text-slate-500">{rel.type} →</span>{" "}
                    {other.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
