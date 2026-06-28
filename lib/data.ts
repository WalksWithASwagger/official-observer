import entitiesJson from "@/data/entities.json";
import relationshipsJson from "@/data/relationships.json";
import type { Dataset, Entity, Relationship } from "@/lib/types";

export const dataset: Dataset = {
  entities: entitiesJson as Entity[],
  relationships: relationshipsJson as Relationship[],
};

export const entityById: Map<string, Entity> = new Map(
  dataset.entities.map((e) => [e.id, e]),
);
