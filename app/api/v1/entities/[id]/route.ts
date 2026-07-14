import { NextResponse } from "next/server";
import { dataset } from "@/lib/data";
import { hasDb, getGraph } from "@/lib/db";

export const runtime = "nodejs";

const CACHE = "public, s-maxage=300, stale-while-revalidate=600";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let entities = dataset.entities;
  let relationships = dataset.relationships;
  if (hasDb()) {
    try {
      const g = await getGraph();
      if (g.entities.length) {
        entities = g.entities;
        relationships = g.relationships;
      }
    } catch {
      /* static fallback */
    }
  }
  const entity = entities.find((e) => e.id === id);
  if (!entity) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const edges = relationships.filter(
    (r) => r.source === id || r.target === id,
  );
  return NextResponse.json(
    { version: 1, license: "CC-BY-4.0", entity, relationships: edges },
    {
      headers: {
        "Cache-Control": CACHE,
        "Access-Control-Allow-Origin": "*",
        "X-Observatory-Api-Version": "1",
      },
    },
  );
}
