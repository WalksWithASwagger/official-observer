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

export type Region =
  | "vancouver"
  | "comox-valley"
  | "fraser-valley"
  | "victoria"
  | "provincial"
  | "national";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  blurb: string;
  initiatives: Initiative[];
  region?: Region;
  tags?: string[];
  links?: EntityLink[];
  joinUrl?: string;
  /** ISO date YYYY-MM-DD — used for Pulse when type is event */
  nextDate?: string;
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

// Categorical palette validated for colorblind separation against the dark
// canvas (project must stay clearly apart from org-blue under protanopia).
export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  person: "#f472b6",
  org: "#5b8def",
  project: "#c084fc",
  event: "#2dd4a7",
  initiative: "#f59e0b",
};

export type ColorMode = "initiative" | "type";
