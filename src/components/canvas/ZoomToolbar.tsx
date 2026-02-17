"use client";

import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useReactFlow, useViewport } from "@xyflow/react";

export function ZoomToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-1 p-1 bg-card/80 backdrop-blur border border-border rounded-lg shadow-sm z-10">
      <button
        onClick={() => zoomIn()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="px-2 min-w-[3.5rem] text-center text-xs font-mono text-text-secondary select-none">
        {Math.round(zoom * 100)}%
      </div>

      <button
        onClick={() => zoomOut()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <button
        onClick={() => fitView()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Fit View"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
