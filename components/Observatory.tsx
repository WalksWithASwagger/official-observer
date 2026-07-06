"use client";

import "@react-sigma/core/lib/style.css";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const subscribeNoop = () => () => {};
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
import {
  GraphErrorBoundary,
  GraphFallback,
  webglSupported,
} from "@/components/GraphErrorBoundary";
import { REGION_CENTROIDS } from "@/lib/regions";
import { drawNodeHover } from "@/lib/rendering";

const DIMMED = "#26324a";

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
    const activeColor =
      active && graph.hasNode(active)
        ? colorMode === "type"
          ? ENTITY_TYPE_COLORS[
              graph.getNodeAttribute(active, "entityType") as EntityType
            ]
          : (graph.getNodeAttribute(active, "color") as string)
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
        if (neighborhood) {
          if (!neighborhood.has(node)) {
            res.color = DIMMED;
            res.label = "";
            res.zIndex = 0;
          } else {
            // Always label the focused cluster, even below the size threshold.
            res.forceLabel = true;
            res.zIndex = 2;
          }
        }
        if (active === node) {
          res.highlighted = true;
          res.zIndex = 3;
        }
        return res;
      },
      edgeReducer: (edge, data) => {
        const res = { ...data };
        const [s, t] = graph.extremities(edge);
        if (!visible.has(s) || !visible.has(t)) {
          res.hidden = true;
          return res;
        }
        if (neighborhood) {
          if (neighborhood.has(s) && neighborhood.has(t)) {
            if (activeColor) res.color = activeColor;
            res.size = (res.size ?? 1) + 0.6;
            res.zIndex = 1;
          } else {
            res.hidden = true;
          }
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
  // Exclusion sets survive late data hydration: entities that arrive from the
  // live API after mount stay visible unless the user opted their group out.
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(
    () => new Set(),
  );
  const [hiddenInitiatives, setHiddenInitiatives] = useState<Set<Initiative>>(
    () => new Set(),
  );
  // Assume WebGL during SSR; the client snapshot corrects it after hydration.
  const canWebgl = useSyncExternalStore(
    subscribeNoop,
    webglSupported,
    () => true,
  );

  // Deep link: read ?node= on mount (re-checked when live data hydrates),
  // write it on selection change.
  const deepLink = useRef<string | null>(null);
  useEffect(() => {
    deepLink.current = new URLSearchParams(window.location.search).get("node");
  }, []);
  useEffect(() => {
    const id = deepLink.current;
    if (id && data.entities.some((e) => e.id === id)) {
      deepLink.current = null;
      setSelected(id);
    }
  }, [data]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("node", selected);
    else url.searchParams.delete("node");
    window.history.replaceState(null, "", url);
  }, [selected]);

  const visible = useMemo(() => {
    const set = new Set<string>();
    for (const e of data.entities) {
      const typeOk = !hiddenTypes.has(e.type);
      const initOk =
        e.initiatives.length === 0 ||
        e.initiatives.some((i) => !hiddenInitiatives.has(i));
      const regionOk = !regionFilter || e.region === regionFilter;
      if (typeOk && initOk && regionOk) set.add(e.id);
    }
    return set;
  }, [data, hiddenTypes, hiddenInitiatives, regionFilter]);

  const active = selected ?? hovered;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const resetFilters = () => {
    setHiddenTypes(new Set());
    setHiddenInitiatives(new Set());
    setRegionFilter(null);
  };

  return (
    <div className="observatory-bg relative h-dvh w-full overflow-hidden">
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
      {view === "graph" && canWebgl === false && (
        <GraphFallback message="This browser doesn't support WebGL, which the graph needs to draw." />
      )}
      {view === "graph" && canWebgl && (
        <GraphErrorBoundary>
          <SigmaContainer
            style={{ height: "100%", width: "100%", background: "transparent" }}
            settings={{
              allowInvalidContainer: true,
              defaultNodeType: "image",
              nodeProgramClasses: { image: NodeImageProgram },
              renderEdgeLabels: false,
              labelColor: { color: "#cbd5e1" },
              labelFont: "var(--font-geist-sans), system-ui, sans-serif",
              labelSize: 12,
              labelWeight: "500",
              // Only label nodes that render reasonably large; zooming in
              // (or selecting) reveals the rest instead of a wall of text.
              labelRenderedSizeThreshold: 7,
              labelDensity: 0.9,
              labelGridCellSize: 90,
              defaultEdgeColor: "#2b3a55",
              defaultDrawNodeHover: drawNodeHover,
              stagePadding: 48,
              zIndex: true,
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
        </GraphErrorBoundary>
      )}

      {view === "graph" && visible.size === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-slate-900/85 px-6 py-5 text-center shadow-2xl backdrop-blur">
            <p className="text-sm text-slate-300">
              Nothing matches the current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-3 rounded-full border border-sky-500/40 bg-sky-500/15 px-4 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/25"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {!embed && (
        <>
          <header className="absolute left-4 top-4 z-20 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/75 px-4 py-2.5 shadow-xl backdrop-blur-md">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 shadow-[0_0_12px_2px_rgba(56,189,248,0.5)]"
              />
              <div className="leading-tight">
                <h1 className="text-sm font-semibold tracking-tight text-slate-100">
                  The Observatory
                </h1>
                <p className="text-[11px] text-slate-400">
                  A living map of BC + AI · ED + AI · Futureproof ·{" "}
                  <a href="/about" className="text-sky-400 hover:underline">
                    about
                  </a>
                </p>
              </div>
            </div>
          </header>

          <FilterBar
            availableTypes={availableTypes}
            hiddenTypes={hiddenTypes}
            hiddenInitiatives={hiddenInitiatives}
            onToggleType={(t) => setHiddenTypes((s) => toggle(s, t))}
            onToggleInitiative={(i) =>
              setHiddenInitiatives((s) => toggle(s, i))
            }
          />
          <SearchBox
            entities={data.entities}
            onSelect={(id) => setSelected(id)}
          />

          {regionFilter && (
            <button
              onClick={() => setRegionFilter(null)}
              aria-label="Clear region filter"
              className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-full border border-sky-500/40 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-200 shadow-xl backdrop-blur hover:bg-sky-500/25"
            >
              Region: {REGION_CENTROIDS[regionFilter].label} ✕
            </button>
          )}

          <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-white/10 bg-slate-900/75 p-3 text-slate-100 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-1 rounded-full bg-white/5 p-0.5">
              {(["graph", "map"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                    view === v
                      ? "bg-sky-500/20 text-sky-100 shadow-inner"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {view === "graph" && (
              <>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Color by
                  </span>
                  {(["initiative", "type"] as ColorMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setColorMode(m)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize transition ${
                        colorMode === m
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <ul className="mt-2 space-y-1">
                  {colorMode === "initiative"
                    ? INITIATIVES.map((i) => (
                        <li
                          key={i.id}
                          className="flex items-center gap-2 text-xs text-slate-300"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: i.color }}
                          />
                          {i.label}
                        </li>
                      ))
                    : availableTypes.map((t) => (
                        <li
                          key={t}
                          className="flex items-center gap-2 text-xs text-slate-300"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: ENTITY_TYPE_COLORS[t] }}
                          />
                          {ENTITY_TYPE_LABELS[t]}
                        </li>
                      ))}
                </ul>
              </>
            )}
          </div>

          <Scorecard
            dataset={data}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 max-sm:hidden"
          />
          <PulsePanel onSelect={(id) => setSelected(id)} />
        </>
      )}

      <EntityPanel
        dataset={data}
        selectedId={selected}
        onSelect={(id) => setSelected(id)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
