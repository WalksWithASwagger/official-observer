"use client";

import "@react-sigma/core/lib/style.css";

import { useEffect, useMemo, useState } from "react";
import {
  SigmaContainer,
  useCamera,
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
} from "@react-sigma/core";
import { createNodeImageProgram } from "@sigma/node-image";
import type Graph from "graphology";

const NodeImageProgram = createNodeImageProgram({
  drawingMode: "background",
  keepWithinCircle: true,
  padding: 0.25,
});

import { dataset } from "@/lib/data";
import { useDataset } from "@/lib/useDataset";
import { buildGraph } from "@/lib/graph";
import {
  ENTITY_TYPES,
  ENTITY_TYPE_COLORS,
  ENTITY_TYPE_LABELS,
  INITIATIVES,
  type ColorMode,
  type EntityType,
  type Initiative,
  type Region,
} from "@/lib/types";
import { EntityPanel } from "@/components/EntityPanel";
import { FilterBar } from "@/components/FilterBar";
import { SearchBox } from "@/components/SearchBox";
import { PulsePanel } from "@/components/PulsePanel";
import { Scorecard } from "@/components/Scorecard";
import { MapView } from "@/components/MapView";
import { REGION_CENTROIDS } from "@/lib/regions";

const DIMMED = "#334155";

function GraphController({
  graph,
  visible,
  active,
  focus,
  colorMode,
  onSelect,
  onHover,
}: {
  graph: Graph;
  visible: Set<string>;
  active: string | null;
  focus: string | null;
  colorMode: ColorMode;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const loadGraph = useLoadGraph();
  const setSettings = useSetSettings();
  const registerEvents = useRegisterEvents();
  const { gotoNode } = useCamera();

  useEffect(() => {
    if (focus && graph.hasNode(focus)) gotoNode(focus);
  }, [focus, graph, gotoNode]);

  useEffect(() => {
    loadGraph(graph);
  }, [loadGraph, graph]);

  useEffect(() => {
    registerEvents({
      clickNode: (e) => onSelect(e.node),
      enterNode: (e) => onHover(e.node),
      leaveNode: () => onHover(null),
      clickStage: () => onSelect(null),
    });
  }, [registerEvents, onSelect, onHover]);

  useEffect(() => {
    const neighborhood = active
      ? new Set<string>([active, ...graph.neighbors(active)])
      : null;

    setSettings({
      nodeReducer: (node, data) => {
        const res = { ...data };
        if (!visible.has(node)) {
          res.hidden = true;
          return res;
        }
        res.color =
          colorMode === "type"
            ? ENTITY_TYPE_COLORS[data.entityType as EntityType] ?? data.color
            : data.color;
        if (neighborhood && !neighborhood.has(node)) {
          res.color = DIMMED;
          res.label = "";
        }
        if (active === node) res.highlighted = true;
        return res;
      },
      edgeReducer: (edge, data) => {
        const res = { ...data };
        const [s, t] = graph.extremities(edge);
        if (!visible.has(s) || !visible.has(t)) {
          res.hidden = true;
          return res;
        }
        if (neighborhood && !(neighborhood.has(s) && neighborhood.has(t))) {
          res.hidden = true;
        }
        return res;
      },
    });
  }, [setSettings, graph, visible, active, colorMode]);

  return null;
}

export default function Observatory({ embed = false }: { embed?: boolean }) {
  const data = useDataset();
  const graph = useMemo(() => buildGraph(data), [data]);

  const availableTypes = useMemo(() => {
    const present = new Set(data.entities.map((e) => e.type));
    return ENTITY_TYPES.filter((t) => present.has(t));
  }, [data]);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("initiative");
  const [view, setView] = useState<"graph" | "map">("graph");
  const [regionFilter, setRegionFilter] = useState<Region | null>(null);
  const [types, setTypes] = useState<Set<EntityType>>(
    () => new Set(dataset.entities.map((e) => e.type)),
  );
  const [initiatives, setInitiatives] = useState<Set<Initiative>>(
    () => new Set(INITIATIVES.map((i) => i.id)),
  );

  // Deep link: read ?node= on mount, write it on selection change.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("node");
    if (id && dataset.entities.some((e) => e.id === id)) setSelected(id);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("node", selected);
    else url.searchParams.delete("node");
    window.history.replaceState(null, "", url);
  }, [selected]);

  const visible = useMemo(() => {
    const set = new Set<string>();
    for (const e of data.entities) {
      const typeOk = types.has(e.type);
      const initOk = e.initiatives.some((i) => initiatives.has(i));
      const regionOk = !regionFilter || e.region === regionFilter;
      if (typeOk && initOk && regionOk) set.add(e.id);
    }
    return set;
  }, [data, types, initiatives, regionFilter]);

  const active = selected ?? hovered;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      {view === "map" && (
        <MapView
          entities={data.entities}
          activeRegion={regionFilter}
          onRegionClick={(r) => {
            setRegionFilter(r);
            setView("graph");
          }}
        />
      )}
      {view === "graph" && (
      <SigmaContainer
        style={{ height: "100%", width: "100%", background: "#020617" }}
        settings={{
          allowInvalidContainer: true,
          defaultNodeType: "image",
          nodeProgramClasses: { image: NodeImageProgram },
          renderEdgeLabels: false,
          labelColor: { color: "#e2e8f0" },
          labelFont: "var(--font-geist-sans), system-ui, sans-serif",
          labelSize: 12,
          labelRenderedSizeThreshold: 4,
          defaultEdgeColor: "#1e293b",
        }}
      >
        <GraphController
          graph={graph}
          visible={visible}
          active={active}
          focus={selected}
          colorMode={colorMode}
          onSelect={setSelected}
          onHover={setHovered}
        />
      </SigmaContainer>
      )}

      {!embed && (
        <>
      <header className="pointer-events-none absolute bottom-4 left-4 z-10 text-slate-400">
        <h1 className="text-sm font-semibold text-slate-200">The Observatory</h1>
        <p className="text-xs">
          A living map of BC + AI · ED + AI · Futureproof —{" "}
          <a href="/about" className="pointer-events-auto text-sky-400 hover:underline">
            about
          </a>
        </p>
      </header>

      <FilterBar
        availableTypes={availableTypes}
        types={types}
        initiatives={initiatives}
        onToggleType={(t) => setTypes((s) => toggle(s, t))}
        onToggleInitiative={(i) => setInitiatives((s) => toggle(s, i))}
      />
      <SearchBox onSelect={(id) => setSelected(id)} />

      {regionFilter && (
        <button
          onClick={() => setRegionFilter(null)}
          className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-full border border-sky-500/40 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-200 shadow-xl backdrop-blur hover:bg-sky-500/25"
        >
          Region: {REGION_CENTROIDS[regionFilter].label} ✕
        </button>
      )}

      <div className="absolute bottom-20 left-4 z-10 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-slate-100 shadow-xl backdrop-blur">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            View
          </span>
          {(["graph", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                view === v
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {view === "graph" && (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            Color by
          </span>
          {(["initiative", "type"] as ColorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setColorMode(m)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                colorMode === m
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        )}
        {view === "graph" && (
        <ul className="space-y-1">
          {colorMode === "initiative"
            ? INITIATIVES.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.color }} />
                  {i.label}
                </li>
              ))
            : availableTypes.map((t) => (
                <li key={t} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS[t] }} />
                  {ENTITY_TYPE_LABELS[t]}
                </li>
              ))}
        </ul>
        )}
      </div>

      <Scorecard className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 max-sm:hidden" />
      <PulsePanel onSelect={(id) => setSelected(id)} />
        </>
      )}

      <EntityPanel
        selectedId={selected}
        onSelect={(id) => setSelected(id)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
