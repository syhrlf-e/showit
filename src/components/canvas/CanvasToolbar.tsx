"use client";

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  LayoutTemplate,
  Plus,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useERDStore } from "@/store/erdStore";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";

export function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, addNode, layoutNodes, toggleGrid, showGrid } = useERDStore(
    useShallow((state) => ({
      nodes: state.nodes,
      addNode: state.addNode,
      layoutNodes: state.layoutNodes,
      toggleGrid: state.toggleGrid,
      showGrid: state.showGrid,
    })),
  );

  const handleAddTable = () => {
    const id = crypto.randomUUID();

    // Generate unique snake_case name
    let baseName = "new_table";
    let counter = 0;
    let newName = baseName;

    while (nodes.some((n) => n.data.label === newName)) {
      counter++;
      newName = `${baseName}_${counter}`;
    }

    addNode({
      id,
      type: "table",
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      data: {
        label: newName,
        columns: [
          {
            id: crypto.randomUUID(),
            name: "id",
            type: "int",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false,
          },
        ],
      },
    });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-card/80 backdrop-blur border border-border rounded-lg shadow-sm z-10">
      <button
        onClick={handleAddTable}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-md text-xs font-medium transition-colors mr-2"
        title="Add New Table"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Table
      </button>
      <div className="w-px h-4 bg-border mx-1" />
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
        onClick={layoutNodes}
        className="p-2 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors"
        title="Auto Layout"
      >
        <LayoutTemplate className="w-4 h-4" />
      </button>
      <button
        onClick={toggleGrid}
        className={clsx(
          "p-2 rounded-md transition-colors",
          showGrid
            ? "bg-primary/20 text-primary"
            : "hover:bg-white/5 text-text-secondary hover:text-text-primary",
        )}
        title="Toggle Grid"
      >
        <Grid className="w-4 h-4" />
      </button>
    </div>
  );
}
