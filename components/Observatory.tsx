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
  useSigma,
} from "@react-sigma/core";
import { createNodeImageProgram } from "@sigma/node-image";
import type Graph from "graphology";
import type { AbstractGraph } from "graphology-types";

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
import { MapView } from "@/components/MapView";
import {
  GraphErrorBoundary,
  GraphFallback,
  webglSupported,
} from "@/components/GraphErrorBoundary";
import { StoryModes, initiativeFromParam } from "@/components/StoryModes";
import { REGION_CENTROIDS } from "@/lib/regions";
import { drawNodeHover } from "@/lib/rendering";
import { ecosystemStats } from "@/lib/stats";

const DIMMED = "#1a2436";

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
  const sigma = useSigma();
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
    // Always resolve against Sigma's live graph — React's useMemo Graph can
    // diverge after hydrate (new auto edge keys → NotFoundGraphError).
    const live: AbstractGraph = sigma.getGraph();
    const lookup: AbstractGraph =
      active && live.hasNode(active) ? live : graph;

    const neighborhood = active && lookup.hasNode(active)
      ? new Set<string>([active, ...lookup.neighbors(active)])
      : null;
    const activeColor =
      active && lookup.hasNode(active)
        ? colorMode === "type"
          ? ENTITY_TYPE_COLORS[
              lookup.getNodeAttribute(active, "entityType") as EntityType
            ]
          : (lookup.getNodeAttribute(active, "color") as string)
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
        if (!live.hasEdge(edge)) {
          res.hidden = true;
          return res;
        }
        const [s, t] = live.extremities(edge);
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
  }, [setSettings, sigma, graph, visible, active, colorMode]);

  return null;
}

function SigmaCanvas({
  graph,
  visible,
  active,
  selected,
  colorMode,
  onSelect,
  onHover,
}: {
  graph: Graph;
  visible: Set<string>;
  active: string | null;
  selected: string | null;
  colorMode: ColorMode;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  // Create image program only after WebGL is confirmed — top-level create
  // crashes when getContext('webgl') returns null.
  const nodeProgramClasses = useMemo(() => {
    const NodeImageProgram = createNodeImageProgram({
      drawingMode: "background",
      keepWithinCircle: true,
      padding: 0.25,
    });
    return { image: NodeImageProgram };
  }, []);

  return (
    <GraphErrorBoundary>
      <SigmaContainer
        style={{ height: "100%", width: "100%", background: "transparent" }}
        settings={{
          allowInvalidContainer: true,
          defaultNodeType: "image",
          nodeProgramClasses,
          renderEdgeLabels: false,
          labelColor: { color: "#c8d4e6" },
          labelFont: "var(--font-plex), system-ui, sans-serif",
          labelSize: 12,
          labelWeight: "500",
          labelRenderedSizeThreshold: 7,
          labelDensity: 0.9,
          labelGridCellSize: 90,
          defaultEdgeColor: "#2a3850",
          defaultDrawNodeHover: drawNodeHover,
          stagePadding: 56,
          zIndex: true,
        }}
      >
        <GraphController
          graph={graph}
          visible={visible}
          active={active}
          focus={selected}
          colorMode={colorMode}
          onSelect={onSelect}
          onHover={onHover}
        />
      </SigmaContainer>
    </GraphErrorBoundary>
  );
}

export default function Observatory({ embed = false }: { embed?: boolean }) {
  const data = useDataset();
  const graph = useMemo(() => buildGraph(data), [data]);
  const stats = useMemo(() => ecosystemStats(data), [data]);

  const availableTypes = useMemo(() => {
    const present = new Set(data.entities.map((e) => e.type));
    return ENTITY_TYPES.filter((t) => present.has(t));
  }, [data]);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("initiative");
  const [view, setView] = useState<"graph" | "map">("graph");
  const [regionFilter, setRegionFilter] = useState<Region | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(
    () => new Set(["org"]),
  );
  const [hiddenInitiatives, setHiddenInitiatives] = useState<Set<Initiative>>(
    () => new Set(),
  );
  const [focusMode, setFocusMode] = useState(false);
  const [chapterBanner, setChapterBanner] = useState<Region | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const canWebgl = useSyncExternalStore(
    subscribeNoop,
    webglSupported,
    () => true,
  );

  const deepLink = useRef<string | null>(null);
  const initiativeParam = useRef<Initiative | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    deepLink.current = params.get("node");
    initiativeParam.current = initiativeFromParam(params.get("initiative"));
    if (initiativeParam.current) {
      const keep = initiativeParam.current;
      setHiddenInitiatives(
        new Set(INITIATIVES.map((i) => i.id).filter((id) => id !== keep)),
      );
    }
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
    if (focusMode && selected && graph.hasNode(selected)) {
      const neighborhood = new Set<string>([
        selected,
        ...graph.neighbors(selected),
      ]);
      for (const id of [...set]) {
        if (!neighborhood.has(id)) set.delete(id);
      }
    }
    return set;
  }, [
    data,
    hiddenTypes,
    hiddenInitiatives,
    regionFilter,
    focusMode,
    selected,
    graph,
  ]);

  const active = selected ?? hovered;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const resetFilters = () => {
    setHiddenTypes(new Set(["org"]));
    setHiddenInitiatives(new Set());
    setRegionFilter(null);
    setFocusMode(false);
    setChapterBanner(null);
  };

  return (
    <div className="observatory-bg relative h-dvh w-full overflow-hidden">
      {/* Full-bleed graph / map — the visual hero */}
      {view === "map" && (
        <MapView
          entities={data.entities}
          activeRegion={regionFilter}
          onRegionClick={(r) => {
            setRegionFilter(r);
            setChapterBanner(r);
            setHiddenTypes(new Set());
            setView("graph");
          }}
        />
      )}
      {view === "graph" && canWebgl === false && (
        <GraphFallback message="This browser doesn't support WebGL, which the graph needs to draw." />
      )}
      {view === "graph" && canWebgl && (
        <SigmaCanvas
          graph={graph}
          visible={visible}
          active={active}
          selected={selected}
          colorMode={colorMode}
          onSelect={setSelected}
          onHover={setHovered}
        />
      )}

      {view === "graph" && visible.size === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="obs-surface-solid obs-animate-in max-w-sm rounded-[var(--radius-panel)] px-6 py-5 text-center">
            <p className="text-sm text-[var(--muted)]">
              Nothing matches the current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-3 rounded-md border border-[color-mix(in_srgb,var(--bc-ai)_45%,transparent)] bg-[color-mix(in_srgb,var(--bc-ai)_18%,transparent)] px-4 py-1.5 text-xs font-medium text-[var(--bc-ai)] transition hover:bg-[color-mix(in_srgb,var(--bc-ai)_28%,transparent)]"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {!embed && (
        <>
          {/* Brand wordmark — hero-level, not a chip */}
          <header className="pointer-events-none absolute left-4 top-4 z-20 max-w-[min(22rem,calc(100vw-5.5rem))] obs-animate-in sm:left-6 sm:top-6">
            <div className="pointer-events-auto">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
                official.observer
              </p>
              <h1 className="font-display mt-0.5 text-[1.85rem] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-[2.35rem]">
                The Observatory
              </h1>
              <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-[var(--muted)] sm:text-[13px]">
                <span style={{ color: "var(--bc-ai)" }}>BC + AI</span>
                {" · "}
                <span style={{ color: "var(--ed-ai)" }}>ED + AI</span>
                {" · "}
                <span style={{ color: "var(--futureproof)" }}>Futureproof</span>
                {" — "}
                <a
                  href="/about"
                  className="text-[var(--foreground)]/70 underline-offset-2 hover:text-[var(--bc-ai)] hover:underline"
                >
                  about
                </a>
              </p>
            </div>
          </header>

          {/* Single command affordance */}
          <div className="absolute right-3 top-3 z-30 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
            <button
              type="button"
              aria-expanded={railOpen}
              aria-controls="observatory-rail"
              onClick={() => setRailOpen((o) => !o)}
              className="obs-surface flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--foreground)] shadow-lg transition hover:border-[var(--line-strong)]"
            >
              <span className="font-display text-base tracking-tight">
                {railOpen ? "Close" : "Explore"}
              </span>
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]"
              >
                {railOpen ? "✕" : "⌘"}
              </span>
            </button>

            {railOpen && (
              <aside
                id="observatory-rail"
                className="obs-surface-solid obs-panel-in flex w-[min(var(--rail-width),calc(100vw-1.5rem))] flex-col gap-3 rounded-[var(--radius-panel)] p-3 shadow-2xl"
              >
                <SearchBox
                  entities={data.entities}
                  onSelect={(id) => {
                    setSelected(id);
                    setRailOpen(false);
                  }}
                  embedded
                />

                <FilterBar
                  availableTypes={availableTypes}
                  hiddenTypes={hiddenTypes}
                  hiddenInitiatives={hiddenInitiatives}
                  onToggleType={(t) => setHiddenTypes((s) => toggle(s, t))}
                  onToggleInitiative={(i) =>
                    setHiddenInitiatives((s) => toggle(s, i))
                  }
                  embedded
                />

                <div className="flex flex-wrap gap-1.5">
                  {(["graph", "map"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                        view === v
                          ? "bg-[color-mix(in_srgb,var(--bc-ai)_22%,transparent)] text-[var(--bc-ai)]"
                          : "bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setHiddenTypes((s) => {
                        const next = new Set(s);
                        if (next.has("org")) next.delete("org");
                        else next.add("org");
                        return next;
                      })
                    }
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      hiddenTypes.has("org")
                        ? "bg-white/5 text-[var(--muted)]"
                        : "bg-[color-mix(in_srgb,var(--bc-ai)_22%,transparent)] text-[var(--bc-ai)]"
                    }`}
                  >
                    {hiddenTypes.has("org") ? "Show orgs" : "Hub lens"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode((f) => !f)}
                    disabled={!selected}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-35 ${
                      focusMode
                        ? "bg-[color-mix(in_srgb,var(--futureproof)_25%,transparent)] text-[var(--futureproof)]"
                        : "bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Focus
                  </button>
                </div>

                {view === "graph" && (
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                        Color
                      </span>
                      {(["initiative", "type"] as ColorMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setColorMode(m)}
                          className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize transition ${
                            colorMode === m
                              ? "bg-white/10 text-white"
                              : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <ul className="space-y-1">
                      {colorMode === "initiative"
                        ? INITIATIVES.map((i) => (
                            <li
                              key={i.id}
                              className="flex items-center gap-2 text-xs text-[var(--muted)]"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: i.color }}
                              />
                              {i.label}
                            </li>
                          ))
                        : availableTypes.map((t) => (
                            <li
                              key={t}
                              className="flex items-center gap-2 text-xs text-[var(--muted)]"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: ENTITY_TYPE_COLORS[t],
                                }}
                              />
                              {ENTITY_TYPE_LABELS[t]}
                            </li>
                          ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 border-t border-[var(--line)] pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToursOpen(true);
                      setRailOpen(false);
                    }}
                    className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-white/10"
                  >
                    Tours
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsOpen((s) => !s)}
                    className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {statsOpen ? "Hide stats" : "Stats"}
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-md px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Reset
                  </button>
                </div>

                {statsOpen && (
                  <dl className="grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-2 text-center">
                    {[
                      { v: stats.totalEntities, l: "entities" },
                      { v: stats.totalRelationships, l: "links" },
                      { v: stats.chapters, l: "chapters" },
                    ].map((s) => (
                      <div key={s.l}>
                        <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                          {s.l}
                        </dt>
                        <dd className="font-display text-lg tabular-nums text-[var(--bc-ai)]">
                          {s.v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </aside>
            )}
          </div>

          {regionFilter && (
            <button
              type="button"
              onClick={() => {
                setRegionFilter(null);
                setChapterBanner(null);
              }}
              aria-label="Clear region filter"
              className="obs-surface absolute left-1/2 top-[5.5rem] z-20 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-[var(--bc-ai)] sm:top-6"
            >
              Region: {REGION_CENTROIDS[regionFilter].label} ✕
            </button>
          )}

          {chapterBanner && !selected && (
            <div className="obs-surface absolute bottom-28 left-4 z-10 hidden max-w-xs rounded-[var(--radius-panel)] p-3 text-sm sm:block">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Chapter hub
              </div>
              <div className="font-display text-base text-[var(--foreground)]">
                {REGION_CENTROIDS[chapterBanner].label}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Region lens on. Select a node, then Focus to isolate its
                neighborhood.
              </p>
            </div>
          )}

          {toursOpen && (
            <StoryModes
              dataset={data}
              onSelect={(id) => setSelected(id)}
              onClose={() => setToursOpen(false)}
            />
          )}

          <PulsePanel
            dataset={data}
            onSelect={(id) => setSelected(id)}
            hasSelection={Boolean(selected)}
          />
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
