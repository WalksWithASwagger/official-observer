import type { EntityType } from "@/lib/types";

// White line-glyphs drawn over each node's colored disc (Sigma image nodes,
// "background" mode). Bundled as data-URIs — same-origin, no network, no CORS.
function glyph(inner: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const ENTITY_ICONS: Record<EntityType, string> = {
  org: glyph("<path d='M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M9 8h2M9 12h2M9 16h2'/>"),
  event: glyph("<rect x='3' y='4' width='18' height='17' rx='2'/><path d='M3 9h18M8 2v4M16 2v4'/>"),
  project: glyph("<path d='M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/>"),
  initiative: glyph("<path d='M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z'/>"),
  person: glyph("<circle cx='12' cy='8' r='4'/><path d='M4 21a8 8 0 0 1 16 0'/>"),
};
