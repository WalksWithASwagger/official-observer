export type EntityType =
  | "person"
  | "org"
  | "project"
  | "event"
  | "initiative";

export type Initiative = "bc-ai" | "ed-ai" | "futureproof";

export interface EntityLink {
  label: string;
  url: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  blurb: string;
  initiatives: Initiative[];
  tags?: string[];
  links?: EntityLink[];
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
  weight?: number;
}

export interface Dataset {
  entities: Entity[];
  relationships: Relationship[];
}

export const ENTITY_TYPES: EntityType[] = [
  "person",
  "org",
  "project",
  "event",
  "initiative",
];

export const INITIATIVES: { id: Initiative; label: string; color: string }[] = [
  { id: "bc-ai", label: "BC + AI", color: "#5b8def" },
  { id: "ed-ai", label: "ED + AI", color: "#2dd4a7" },
  { id: "futureproof", label: "Futureproof", color: "#f59e0b" },
];

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  person: "Person",
  org: "Organization",
  project: "Project",
  event: "Event",
  initiative: "Initiative",
};
