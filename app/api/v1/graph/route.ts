import { NextResponse } from "next/server";
import { dataset } from "@/lib/data";
import { hasDb, getGraph } from "@/lib/db";

export const runtime = "nodejs";

const CACHE = "public, s-maxage=300, stale-while-revalidate=600";

/**
 * Versioned public graph API (CC BY 4.0 dataset).
 * Same payload as /api/graph with an explicit contract version.
 */
export async function GET() {
  const headers = {
    "Cache-Control": CACHE,
    "Access-Control-Allow-Origin": "*",
    "X-Observatory-Api-Version": "1",
    "X-Observatory-License": "CC-BY-4.0",
  };

  if (!hasDb()) {
    return NextResponse.json(
      { version: 1, license: "CC-BY-4.0", ...dataset },
      { headers },
    );
  }
  try {
    const graph = await getGraph();
    const data = graph.entities.length > 0 ? graph : dataset;
    return NextResponse.json(
      { version: 1, license: "CC-BY-4.0", ...data },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { version: 1, license: "CC-BY-4.0", ...dataset },
      { headers },
    );
  }
}
