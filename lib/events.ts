import eventsJson from "@/data/events.json";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  entityId: string;
  location?: string;
  url?: string;
}

export const FUTUREPROOF_DATE = "2026-10-28";

const events = eventsJson as EventItem[];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysUntil(dateIso: string, now: Date = new Date()): number {
  const target = startOfDay(new Date(`${dateIso}T00:00:00`));
  const today = startOfDay(now);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function upcomingEvents(now: Date = new Date()): EventItem[] {
  return events
    .filter((e) => daysUntil(e.date, now) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}
