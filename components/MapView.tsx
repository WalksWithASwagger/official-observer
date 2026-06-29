"use client";

import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, MultiPoint } from "geojson";
import bcGeoJson from "@/data/bc-geo.json";
import { REGION_CENTROIDS } from "@/lib/regions";
import type { Entity, Region } from "@/lib/types";

const W = 960;
const H = 720;
const bcGeo = bcGeoJson as FeatureCollection;

// Focus the view on the populated southwest (Metro Vancouver · Island · Valley)
// so chapters separate, instead of fitting all of BC and crowding one corner.
const focus: MultiPoint = {
  type: "MultiPoint",
  coordinates: Object.values(REGION_CENTROIDS)
    .filter((c) => c.plot)
    .map((c) => [c.lng, c.lat]),
};

export function MapView({
  entities,
  activeRegion,
  onRegionClick,
}: {
  entities: Entity[];
  activeRegion: Region | null;
  onRegionClick: (r: Region) => void;
}) {
  const projection = useMemo(
    () => geoMercator().fitExtent([[120, 90], [W - 120, H - 110]], focus),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const counts = useMemo(() => {
    const m = {} as Record<Region, number>;
    for (const e of entities) {
      if (e.region) m[e.region] = (m[e.region] ?? 0) + 1;
    }
    return m;
  }, [entities]);

  const offMap = (counts.provincial ?? 0) + (counts.national ?? 0);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <path
          d={path(bcGeo) ?? undefined}
          fill="#16243c"
          stroke="#64748b"
          strokeWidth={2}
        />
        {(Object.entries(REGION_CENTROIDS) as [Region, (typeof REGION_CENTROIDS)[Region]][])
          .filter(([region, c]) => c.plot && (counts[region] ?? 0) > 0)
          .map(([region, c]) => {
            const pt = projection([c.lng, c.lat]);
            if (!pt) return null;
            const n = counts[region] ?? 0;
            const r = 8 + Math.sqrt(n) * 4;
            const active = activeRegion === region;
            return (
              <g
                key={region}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                onClick={() => onRegionClick(region)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={r}
                  fill={active ? "#5b8def66" : "#5b8def33"}
                  stroke="#5b8def"
                  strokeWidth={active ? 3 : 1.5}
                />
                <text textAnchor="middle" dy="0.35em" className="fill-white text-[13px] font-semibold">
                  {n}
                </text>
                <text textAnchor="middle" y={r + 14} className="fill-slate-300 text-[12px]">
                  {c.label}
                </text>
              </g>
            );
          })}
      </svg>

      {offMap > 0 && (
        <div className="absolute right-4 top-20 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 shadow-xl backdrop-blur">
          + {counts.provincial ?? 0} province-wide · {counts.national ?? 0} national
        </div>
      )}
    </div>
  );
}
