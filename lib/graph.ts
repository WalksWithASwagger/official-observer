import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { INITIATIVES, type Dataset, type Entity } from "@/lib/types";

const NEUTRAL = "#94a3b8";

export function initiativeColor(entity: Entity): string {
  const primary = entity.initiatives[0];
  return INITIATIVES.find((i) => i.id === primary)?.color ?? NEUTRAL;
}

/**
 * Build a laid-out graphology graph from the dataset. Node positions come from
 * ForceAtlas2 so clusters separate by how densely entities are connected.
 */
export function buildGraph(dataset: Dataset): Graph {
  const graph = new Graph({ multi: false, type: "undirected" });

  dataset.entities.forEach((entity, i) => {
    // Seed positions on a circle; ForceAtlas2 needs non-coincident starts.
    const angle = (2 * Math.PI * i) / dataset.entities.length;
    graph.addNode(entity.id, {
      label: entity.name,
      entityType: entity.type,
      initiatives: entity.initiatives,
      color: initiativeColor(entity),
      x: Math.cos(angle),
      y: Math.sin(angle),
      size: 4,
    });
  });

  dataset.relationships.forEach((rel) => {
    if (!graph.hasNode(rel.source) || !graph.hasNode(rel.target)) return;
    if (graph.hasEdge(rel.source, rel.target)) return;
    graph.addEdge(rel.source, rel.target, {
      relType: rel.type,
      weight: rel.weight ?? 1,
      color: "#d8dee9",
      size: rel.weight ?? 1,
    });
  });

  // Size nodes by degree so hubs read as hubs.
  graph.forEachNode((node) => {
    const degree = graph.degree(node);
    graph.setNodeAttribute(node, "size", 5 + Math.sqrt(degree) * 3);
  });

  forceAtlas2.assign(graph, {
    iterations: 300,
    settings: {
      gravity: 1,
      scalingRatio: 12,
      barnesHutOptimize: false,
      adjustSizes: true,
    },
  });

  return graph;
}
