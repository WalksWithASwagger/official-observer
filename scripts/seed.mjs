#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.log("No POSTGRES_URL/DATABASE_URL — skipping seed (static fallback in use).");
  process.exit(0);
}

const { sql } = await import("@vercel/postgres");
const entities = JSON.parse(readFileSync(join(root, "data/entities.json"), "utf8"));
const relationships = JSON.parse(readFileSync(join(root, "data/relationships.json"), "utf8"));

await sql`CREATE TABLE IF NOT EXISTS entities (
  id text PRIMARY KEY, type text NOT NULL, name text NOT NULL, blurb text,
  initiatives jsonb NOT NULL DEFAULT '[]'::jsonb, region text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb, links jsonb NOT NULL DEFAULT '[]'::jsonb,
  join_url text, next_date text
)`;
await sql`ALTER TABLE entities ADD COLUMN IF NOT EXISTS join_url text`;
await sql`ALTER TABLE entities ADD COLUMN IF NOT EXISTS next_date text`;
await sql`CREATE TABLE IF NOT EXISTS relationships (
  source text NOT NULL, target text NOT NULL, type text NOT NULL, weight real,
  PRIMARY KEY (source, target, type)
)`;

await sql`DELETE FROM relationships`;
await sql`DELETE FROM entities`;

for (const e of entities) {
  await sql`
    INSERT INTO entities (id, type, name, blurb, initiatives, region, tags, links, join_url, next_date)
    VALUES (${e.id}, ${e.type}, ${e.name}, ${e.blurb ?? ""},
      ${JSON.stringify(e.initiatives ?? [])}::jsonb, ${e.region ?? null},
      ${JSON.stringify(e.tags ?? [])}::jsonb, ${JSON.stringify(e.links ?? [])}::jsonb,
      ${e.joinUrl ?? null}, ${e.nextDate ?? null})
    ON CONFLICT (id) DO UPDATE SET type=EXCLUDED.type, name=EXCLUDED.name,
      blurb=EXCLUDED.blurb, initiatives=EXCLUDED.initiatives, region=EXCLUDED.region,
      tags=EXCLUDED.tags, links=EXCLUDED.links, join_url=EXCLUDED.join_url,
      next_date=EXCLUDED.next_date`;
}
for (const r of relationships) {
  await sql`
    INSERT INTO relationships (source, target, type, weight)
    VALUES (${r.source}, ${r.target}, ${r.type}, ${r.weight ?? null})
    ON CONFLICT (source, target, type) DO UPDATE SET weight=EXCLUDED.weight`;
}

console.log(`Seeded ${entities.length} entities, ${relationships.length} relationships.`);
process.exit(0);
