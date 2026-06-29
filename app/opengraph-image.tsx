import { ImageResponse } from "next/og";
import { ecosystemStats } from "@/lib/stats";

export const alt = "The Observatory — a living map of BC + AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const s = ecosystemStats();
  const stats = [
    [s.totalEntities, "entities"],
    [s.totalRelationships, "connections"],
    [s.events, "programs"],
    [s.chapters, "chapters"],
  ] as const;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#020617",
          color: "#e2e8f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
          {["#5b8def", "#2dd4a7", "#f59e0b"].map((c) => (
            <div key={c} style={{ width: 28, height: 28, borderRadius: 999, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.02em" }}>
          The Observatory
        </div>
        <div style={{ fontSize: 34, color: "#94a3b8", marginTop: 8 }}>
          A living map of BC + AI · ED + AI · Futureproof
        </div>
        <div style={{ display: "flex", gap: "48px", marginTop: 56 }}>
          {stats.map(([n, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 56, fontWeight: 700, color: "#38bdf8" }}>{n}</span>
              <span style={{ fontSize: 24, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 26, color: "#64748b", marginTop: 56 }}>official.observer</div>
      </div>
    ),
    size,
  );
}
