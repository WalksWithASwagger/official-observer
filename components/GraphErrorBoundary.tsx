"use client";

import { Component, type ReactNode } from "react";

let webglProbe: boolean | undefined;

export function webglSupported(): boolean {
  if (webglProbe !== undefined) return webglProbe;
  try {
    const canvas = document.createElement("canvas");
    webglProbe = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")),
    );
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

export function GraphFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="obs-surface-solid max-w-sm rounded-[var(--radius-panel)] p-6 text-center">
        <p className="font-display text-lg text-[var(--foreground)]">{message}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          The full dataset is still available on the{" "}
          <a href="/about" className="text-[var(--bc-ai)] hover:underline">
            about page
          </a>
          , or try reloading.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md border border-[color-mix(in_srgb,var(--bc-ai)_45%,transparent)] bg-[color-mix(in_srgb,var(--bc-ai)_15%,transparent)] px-4 py-1.5 text-xs font-medium text-[var(--bc-ai)] transition hover:bg-[color-mix(in_srgb,var(--bc-ai)_25%,transparent)]"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

/**
 * The graph canvas needs WebGL and third-party rendering code; if either
 * throws, fail to a small notice instead of white-screening the whole app.
 */
export class GraphErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <GraphFallback message="The graph view hit a rendering error." />;
    }
    return this.props.children;
  }
}
