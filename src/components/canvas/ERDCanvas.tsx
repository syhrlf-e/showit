"use client";

import {
  ReactFlow,
  Background,
  type NodeTypes,
  type EdgeTypes,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./TableNode";
import { RelationshipEdge } from "./RelationshipEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { useERDStore } from "@/store/erdStore";

const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

export function ERDCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useERDStore();
  const theme = useERDStore((state) => state.theme);

  // Sync theme with document class
  if (typeof document !== "undefined") {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <div className="w-full h-full bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode={theme}
        className="bg-background"
        minZoom={0.1}
        maxZoom={2}
      >
        {useERDStore((state) => state.showGrid) && (
          <Background gap={16} size={1} color="#2a2a2a" />
        )}
        <MiniMap
          className="!bg-card !border-border"
          maskColor="#0a0a0a"
          nodeColor="#3b82f6"
        />
        <CanvasToolbar />
      </ReactFlow>
    </div>
  );
}
