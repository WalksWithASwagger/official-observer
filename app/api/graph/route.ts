import { NextResponse } from "next/server";
import { dataset } from "@/lib/data";
import { hasDb, getGraph } from "@/lib/db";

export const runtime = "nodejs";

const CACHE = "public, s-maxage=300, stale-while-revalidate=600";

export async function GET() {
  // Static fallback: when no DB is configured (or it errors), serve the
  // version-controlled seed so the app always works.
  if (!hasDb()) {
    return NextResponse.json(dataset, { headers: { "Cache-Control": CACHE } });
  }
  try {
    const graph = await getGraph();
    const data = graph.entities.length > 0 ? graph : dataset;
    return NextResponse.json(data, { headers: { "Cache-Control": CACHE } });
  } catch {
    return NextResponse.json(dataset, { headers: { "Cache-Control": CACHE } });
  }
}
