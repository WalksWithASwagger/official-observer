"use client";

import "@react-sigma/core/lib/style.css";

import { useEffect, useMemo, useState } from "react";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
} from "@react-sigma/core";
import type Graph from "graphology";

import { dataset } from "@/lib/data";
import { buildGraph } from "@/lib/graph";
import { INITIATIVES, type EntityType, type Initiative } from "@/lib/types";
import { EntityPanel } from "@/components/EntityPanel";
import { FilterBar } from "@/components/FilterBar";
import { SearchBox } from "@/components/SearchBox";

const DIMMED = "#334155";

function GraphController({
  graph,
  visible,
  active,
  onSelect,
  onHover,
}: {
  graph: Graph;
  visible: Set<string>;
  active: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const loadGraph = useLoadGraph();
  const setSettings = useSetSettings();
  const registerEvents = useRegisterEvents();

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
  }, [setSettings, graph, visible, active]);

  return null;
}

export default function Observatory() {
  const graph = useMemo(() => buildGraph(dataset), []);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [types, setTypes] = useState<Set<EntityType>>(
    () => new Set(dataset.entities.map((e) => e.type)),
  );
  const [initiatives, setInitiatives] = useState<Set<Initiative>>(
    () => new Set(INITIATIVES.map((i) => i.id)),
  );

  const visible = useMemo(() => {
    const set = new Set<string>();
    for (const e of dataset.entities) {
      const typeOk = types.has(e.type);
      const initOk = e.initiatives.some((i) => initiatives.has(i));
      if (typeOk && initOk) set.add(e.id);
    }
    return set;
  }, [types, initiatives]);

  const active = selected ?? hovered;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <SigmaContainer
        style={{ height: "100%", width: "100%", background: "#020617" }}
        settings={{
          allowInvalidContainer: true,
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
          onSelect={setSelected}
          onHover={setHovered}
        />
      </SigmaContainer>

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
        types={types}
        initiatives={initiatives}
        onToggleType={(t) => setTypes((s) => toggle(s, t))}
        onToggleInitiative={(i) => setInitiatives((s) => toggle(s, i))}
      />
      <SearchBox onSelect={(id) => setSelected(id)} />
      <EntityPanel
        selectedId={selected}
        onSelect={(id) => setSelected(id)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
