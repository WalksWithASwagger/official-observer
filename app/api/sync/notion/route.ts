import { NextRequest, NextResponse } from "next/server";
import type { Entity, EntityType, Initiative, Region, Relationship } from "@/lib/types";
import { hasDb, ensureSchema, upsertEntities, upsertRelationships } from "@/lib/db";

export const runtime = "nodejs";

const NOTION_VERSION = "2022-06-28";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (req.headers.get("x-vercel-cron")) return true; // Vercel-scheduled
  if (!secret) return true; // no secret configured → allow (dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Notion select/multi-select labels → the site's enum values.
const TYPE_MAP: Record<string, EntityType> = {
  organization: "org",
  org: "org",
  event: "event",
  project: "project",
  initiative: "initiative",
};
const INITIATIVE_MAP: Record<string, Initiative> = {
  "bc + ai": "bc-ai",
  "bc+ai": "bc-ai",
  "ed + ai": "ed-ai",
  "ed+ai": "ed-ai",
  futureproof: "futureproof",
};
const REGION_MAP: Record<string, Region> = {
  vancouver: "vancouver",
  "comox valley": "comox-valley",
  "fraser valley": "fraser-valley",
  victoria: "victoria",
  provincial: "provincial",
  national: "national",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const title = (p: any): string => (p?.title ?? []).map((t: any) => t.plain_text).join("").trim();
const richText = (p: any): string => (p?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
const selectName = (p: any): string | null => p?.select?.name ?? null;
const multiNames = (p: any): string[] => (p?.multi_select ?? []).map((m: any) => m.name);
const urlVal = (p: any): string | null => p?.url ?? null;
const numberVal = (p: any): number | null => (typeof p?.number === "number" ? p.number : null);
const relationIds = (p: any): string[] => (p?.relation ?? []).map((r: any) => r.id);

async function queryAll(dbId: string, token: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 }),
    });
    if (!res.ok) throw new Error(`Notion query ${dbId} failed: ${res.status}`);
    const json = await res.json();
    out.push(...(json.results ?? []));
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return out;
}

function isPublic(props: any): boolean {
  const s = (selectName(props["Status"]) ?? "").toLowerCase();
  return s === "public";
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = process.env.NOTION_TOKEN;
  const entitiesDb = process.env.OBSERVATORY_ENTITIES_DB_ID;
  const relsDb = process.env.OBSERVATORY_RELATIONSHIPS_DB_ID;

  if (!token) return NextResponse.json({ skipped: true, reason: "no NOTION_TOKEN" });
  if (!entitiesDb) return NextResponse.json({ skipped: true, reason: "no OBSERVATORY_ENTITIES_DB_ID" });
  if (!hasDb()) return NextResponse.json({ skipped: true, reason: "no database configured" });

  // 1) Entities — public only. Build the Notion-pageId → site-id lookup so
  //    relationship endpoints can be resolved.
  const entityPages = await queryAll(entitiesDb, token);
  const entities: Entity[] = [];
  const pageIdToId = new Map<string, string>();
  let entityScanned = 0;

  for (const page of entityPages) {
    entityScanned++;
    const props = page.properties ?? {};
    if (!isPublic(props)) continue;

    const type = TYPE_MAP[(selectName(props["Type"]) ?? "").toLowerCase()];
    if (!type || type === "person") continue; // never publish people / unknown types

    const name = title(props["Name"]);
    if (!name) continue;

    const id = `${type}-${slugify(name)}`;
    const links: { label: string; url: string }[] = [];
    const website = urlVal(props["Website"]);
    const linkedin = urlVal(props["LinkedIn"]);
    if (website) links.push({ label: "Website", url: website });
    if (linkedin) links.push({ label: "LinkedIn", url: linkedin });

    const region = REGION_MAP[(selectName(props["Region"]) ?? "").toLowerCase()];
    const initiatives = multiNames(props["Initiatives"])
      .map((n) => INITIATIVE_MAP[n.toLowerCase()])
      .filter(Boolean) as Initiative[];

    pageIdToId.set(page.id, id);
    entities.push({
      id,
      type,
      name,
      blurb: richText(props["Blurb"]),
      initiatives: initiatives.length ? initiatives : ["bc-ai"],
      region: region ?? undefined,
      tags: multiNames(props["Tags"]),
      links: links.length ? links : undefined,
      joinUrl: urlVal(props["Join URL"]) ?? undefined,
    });
  }

  // 2) Relationships — public only, and only when BOTH endpoints are public entities.
  const relationships: Relationship[] = [];
  let relScanned = 0;
  if (relsDb) {
    const relPages = await queryAll(relsDb, token);
    for (const page of relPages) {
      relScanned++;
      const props = page.properties ?? {};
      if (!isPublic(props)) continue;
      const sourcePage = relationIds(props["Source"])[0];
      const targetPage = relationIds(props["Target"])[0];
      const source = sourcePage && pageIdToId.get(sourcePage);
      const target = targetPage && pageIdToId.get(targetPage);
      if (!source || !target) continue; // endpoint not a public entity → drop
      const relType = selectName(props["Type"]) ?? richText(props["Type"]) ?? "related";
      relationships.push({
        source,
        target,
        type: relType || "related",
        weight: numberVal(props["Weight"]) ?? undefined,
      });
    }
  }

  // 3) Mirror into Postgres (full replace of the public set).
  await ensureSchema();
  const { sql } = await import("@vercel/postgres");
  await sql`DELETE FROM relationships`;
  await sql`DELETE FROM entities`;
  await upsertEntities(entities);
  await upsertRelationships(relationships);

  return NextResponse.json({
    entities: entities.length,
    relationships: relationships.length,
    scanned: { entities: entityScanned, relationships: relScanned },
  });
}
