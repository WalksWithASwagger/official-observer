"use client";

import { useEffect, useState } from "react";
import { dataset as staticDataset } from "@/lib/data";
import type { Dataset } from "@/lib/types";

function fingerprint(d: Dataset): string {
  return [
    d.entities.length,
    d.relationships.length,
    d.entities
      .map((e) => `${e.id}:${e.nextDate ?? ""}:${e.joinUrl ?? ""}`)
      .join(","),
    d.relationships.map((r) => `${r.source}>${r.type}>${r.target}`).join(","),
  ].join("|");
}

/**
 * Source-agnostic data access. Starts from the version-controlled static seed
 * (so SSR + first paint are instant and the app works with no backend), then
 * hydrates from the live API when NEXT_PUBLIC_GRAPH_API is set.
 * Skips setState when the payload matches what we already have (avoids
 * needless Sigma reload races).
 */
export function useDataset(): Dataset {
  const [data, setData] = useState<Dataset>(staticDataset);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_GRAPH_API;
    if (!api) return;
    let cancelled = false;
    const current = fingerprint(staticDataset);
    fetch(api)
      .then((r) => r.json())
      .then((d: Dataset) => {
        if (cancelled || !d?.entities?.length) return;
        if (fingerprint(d) === current) return;
        setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
