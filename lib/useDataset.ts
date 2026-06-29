"use client";

import { useEffect, useState } from "react";
import { dataset as staticDataset } from "@/lib/data";
import type { Dataset } from "@/lib/types";

/**
 * Source-agnostic data access. Starts from the version-controlled static seed
 * (so SSR + first paint are instant and the app works with no backend), then
 * hydrates from the live API when NEXT_PUBLIC_GRAPH_API is set.
 */
export function useDataset(): Dataset {
  const [data, setData] = useState<Dataset>(staticDataset);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_GRAPH_API;
    if (!api) return;
    let cancelled = false;
    fetch(api)
      .then((r) => r.json())
      .then((d: Dataset) => {
        if (!cancelled && d?.entities?.length) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
