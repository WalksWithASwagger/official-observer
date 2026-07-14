import { sql } from "@vercel/postgres";
import type { Dataset, Entity, Relationship } from "@/lib/types";

export function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

export async function ensureSchema(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS entities (
    id text PRIMARY KEY,
    type text NOT NULL,
    name text NOT NULL,
    blurb text,
    initiatives jsonb NOT NULL DEFAULT '[]'::jsonb,
    region text,
    tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    links jsonb NOT NULL DEFAULT '[]'::jsonb,
    join_url text,
    next_date text
  )`;
  await sql`ALTER TABLE entities ADD COLUMN IF NOT EXISTS join_url text`;
  await sql`ALTER TABLE entities ADD COLUMN IF NOT EXISTS next_date text`;
  await sql`CREATE TABLE IF NOT EXISTS relationships (
    source text NOT NULL,
    target text NOT NULL,
    type text NOT NULL,
    weight real,
    PRIMARY KEY (source, target, type)
  )`;
}

export async function getGraph(): Promise<Dataset> {
  const ents = await sql`
    SELECT id, type, name, blurb, initiatives, region, tags, links, join_url, next_date
    FROM entities
  `;
  const rels = await sql`SELECT source, target, type, weight FROM relationships`;

  const entities: Entity[] = ents.rows.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    blurb: r.blurb ?? "",
    initiatives: r.initiatives ?? [],
    region: r.region ?? undefined,
    tags: r.tags ?? undefined,
    links: r.links ?? undefined,
    joinUrl: r.join_url ?? undefined,
    nextDate: r.next_date ?? undefined,
  }));

  const relationships: Relationship[] = rels.rows.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type,
    weight: r.weight ?? undefined,
  }));

  return { entities, relationships };
}

export async function getEntity(id: string): Promise<Entity | null> {
  const { entities } = await getGraph();
  return entities.find((e) => e.id === id) ?? null;
}

export async function upsertEntities(entities: Entity[]): Promise<number> {
  for (const e of entities) {
    await sql`
      INSERT INTO entities (id, type, name, blurb, initiatives, region, tags, links, join_url, next_date)
      VALUES (
        ${e.id}, ${e.type}, ${e.name}, ${e.blurb ?? ""},
        ${JSON.stringify(e.initiatives ?? [])}::jsonb,
        ${e.region ?? null},
        ${JSON.stringify(e.tags ?? [])}::jsonb,
        ${JSON.stringify(e.links ?? [])}::jsonb,
        ${e.joinUrl ?? null},
        ${e.nextDate ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
        initiatives = EXCLUDED.initiatives, region = EXCLUDED.region,
        tags = EXCLUDED.tags, links = EXCLUDED.links,
        join_url = EXCLUDED.join_url, next_date = EXCLUDED.next_date
    `;
  }
  return entities.length;
}

export async function upsertRelationships(rels: Relationship[]): Promise<number> {
  for (const r of rels) {
    await sql`
      INSERT INTO relationships (source, target, type, weight)
      VALUES (${r.source}, ${r.target}, ${r.type}, ${r.weight ?? null})
      ON CONFLICT (source, target, type) DO UPDATE SET weight = EXCLUDED.weight
    `;
  }
  return rels.length;
}
