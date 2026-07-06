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
      <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center shadow-xl backdrop-blur">
        <p className="text-sm font-medium text-slate-200">{message}</p>
        <p className="mt-2 text-xs text-slate-400">
          The full dataset is still available on the{" "}
          <a href="/about" className="text-sky-400 hover:underline">
            about page
          </a>
          , or try reloading.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full border border-sky-500/40 bg-sky-500/15 px-4 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/25"
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
