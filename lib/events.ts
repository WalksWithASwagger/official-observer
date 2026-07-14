import eventsJson from "@/data/events.json";
import type { Dataset, Entity } from "@/lib/types";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  entityId: string;
  location?: string;
  url?: string;
}

/** Fallback festival date when entity nextDate is missing. */
export const FUTUREPROOF_FALLBACK_DATE = "2026-10-28";
export const FUTUREPROOF_ENTITY_ID = "event-futureproof-festival-2026";

const seedEvents = eventsJson as EventItem[];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysUntil(dateIso: string, now: Date = new Date()): number {
  const target = startOfDay(new Date(`${dateIso}T00:00:00`));
  const today = startOfDay(now);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Prefer live Event entities with nextDate; fall back to seed JSON. */
export function upcomingEvents(
  dataset?: Dataset | null,
  now: Date = new Date(),
): EventItem[] {
  const fromEntities: EventItem[] = (dataset?.entities ?? [])
    .filter((e): e is Entity & { nextDate: string } =>
      e.type === "event" && Boolean(e.nextDate),
    )
    .map((e) => ({
      id: `live-${e.id}`,
      name: e.name,
      date: e.nextDate!,
      entityId: e.id,
      url: e.joinUrl,
    }));

  const source = fromEntities.length > 0 ? fromEntities : seedEvents;
  return source
    .filter((e) => daysUntil(e.date, now) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function futureproofDate(dataset?: Dataset | null): string {
  const fest = dataset?.entities.find((e) => e.id === FUTUREPROOF_ENTITY_ID);
  return fest?.nextDate ?? FUTUREPROOF_FALLBACK_DATE;
}

/** @deprecated use FUTUREPROOF_FALLBACK_DATE or futureproofDate() */
export const FUTUREPROOF_DATE = FUTUREPROOF_FALLBACK_DATE;
