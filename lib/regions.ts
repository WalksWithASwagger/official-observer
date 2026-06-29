import type { Region } from "@/lib/types";

export const REGION_CENTROIDS: Record<
  Region,
  { label: string; lng: number; lat: number; plot: boolean }
> = {
  vancouver: { label: "Vancouver", lng: -123.12, lat: 49.28, plot: true },
  "comox-valley": { label: "Comox Valley", lng: -124.93, lat: 49.67, plot: true },
  "fraser-valley": { label: "Fraser Valley", lng: -122.33, lat: 49.05, plot: true },
  victoria: { label: "Victoria", lng: -123.37, lat: 48.43, plot: true },
  provincial: { label: "Province-wide", lng: -125.0, lat: 54.0, plot: false },
  national: { label: "National", lng: -106.3, lat: 56.1, plot: false },
};
