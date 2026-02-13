"use client";

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Moon,
  Download,
  LayoutTemplate,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

export function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-card/80 backdrop-blur border border-border rounded-lg shadow-sm z-10">
      <button
        onClick={() => zoomIn()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={() => fitView()}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Fit View"
      >
        <Maximize className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1" />
      <button
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Auto Layout"
      >
        <LayoutTemplate className="w-4 h-4" />
      </button>
      <button
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Toggle Grid"
      >
        <Grid className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1" />
      <button
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Toggle Theme"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Export"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}
