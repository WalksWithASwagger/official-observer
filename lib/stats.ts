import { dataset } from "@/lib/data";

export interface EcosystemStats {
  totalEntities: number;
  totalRelationships: number;
  orgs: number;
  events: number;
  projects: number;
  initiatives: number;
  partners: number;
  sponsors: number;
  chapters: number;
  venues: number;
}

export function ecosystemStats(): EcosystemStats {
  const { entities, relationships } = dataset;

  return {
    totalEntities: entities.length,
    totalRelationships: relationships.length,
    orgs: entities.filter((e) => e.type === "org").length,
    events: entities.filter((e) => e.type === "event").length,
    projects: entities.filter((e) => e.type === "project").length,
    initiatives: entities.filter((e) => e.type === "initiative").length,
    partners: entities.filter((e) => e.tags?.includes("partner")).length,
    sponsors: entities.filter((e) => e.tags?.includes("sponsor")).length,
    chapters: entities.filter(
      (e) => e.type === "event" && e.tags?.includes("chapter"),
    ).length,
    venues: entities.filter((e) => e.tags?.includes("venue")).length,
  };
}
