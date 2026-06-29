import { NextRequest, NextResponse } from "next/server";
import type { Entity, Region } from "@/lib/types";
import { hasDb, ensureSchema, upsertEntities } from "@/lib/db";

export const runtime = "nodejs";

const DEFAULT_DB = "1f0c6f799a3381bd8332ca0235c24655";
const NOTION_VERSION = "2022-06-28";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (req.headers.get("x-vercel-cron")) return true; // Vercel-scheduled
  if (!secret) return true; // no secret configured → allow (dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const REGION_MAP: Record<string, Region> = {
  vancouver: "vancouver",
  "metro vancouver": "vancouver",
  "comox valley": "comox-valley",
  "fraser valley": "fraser-valley",
  victoria: "victoria",
  "vancouver island": "victoria",
};

function mapRegion(bcRegion: string | null): Region {
  if (!bcRegion) return "provincial";
  return REGION_MAP[bcRegion.trim().toLowerCase()] ?? "provincial";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function title(p: any): string {
  return (p?.title ?? []).map((t: any) => t.plain_text).join("").trim();
}
function richText(p: any): string {
  return (p?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
}
function selectName(p: any): string | null {
  return p?.select?.name ?? null;
}
function multiNames(p: any): string[] {
  return (p?.multi_select ?? []).map((m: any) => m.name);
}
function urlVal(p: any): string | null {
  return p?.url ?? null;
}

function toEntity(page: any): Entity | null {
  const props = page.properties ?? {};
  const status = (selectName(props["Status"]) ?? "").toLowerCase();
  if (status !== "public" && status !== "live") return null; // public gate

  const name = title(props["Name"]);
  if (!name) return null;

  const links: { label: string; url: string }[] = [];
  const website = urlVal(props["Website"]);
  const linkedin = urlVal(props["LinkedIn"]);
  if (website) links.push({ label: "Website", url: website });
  if (linkedin) links.push({ label: "LinkedIn", url: linkedin });

  return {
    id: `org-${slugify(name)}`,
    type: "org", // never emit people
    name,
    blurb: richText(props["Short Blurb"]),
    initiatives: ["bc-ai"],
    region: mapRegion(selectName(props["BC Region"])),
    tags: multiNames(props["AI Focus Areas"]),
    links: links.length ? links : undefined,
  };
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
  if (!token) {
    return NextResponse.json({ skipped: true, reason: "no NOTION_TOKEN" });
  }
  if (!hasDb()) {
    return NextResponse.json({ skipped: true, reason: "no database configured" });
  }

  const dbId = process.env.AI_COMPANY_DB_ID || DEFAULT_DB;
  const entities: Entity[] = [];
  let cursor: string | undefined;
  let scanned = 0;

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
    if (!res.ok) {
      return NextResponse.json(
        { error: "notion query failed", status: res.status },
        { status: 502 },
      );
    }
    const json = await res.json();
    for (const page of json.results ?? []) {
      scanned++;
      const ent = toEntity(page);
      if (ent) entities.push(ent);
    }
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);

  await ensureSchema();
  const synced = await upsertEntities(entities);

  return NextResponse.json({ synced, scanned, gated_out: scanned - synced });
}
