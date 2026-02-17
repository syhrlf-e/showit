"use client";

import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  type NodeTypes,
  type EdgeTypes,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./TableNode";
import { RelationshipEdge } from "./RelationshipEdge";
import { ZoomToolbar } from "./ZoomToolbar";
import { ActionToolbar } from "./ActionToolbar";
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

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

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
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        colorMode={theme}
        connectionMode={ConnectionMode.Loose}
        className="bg-background"
        minZoom={0.1}
        maxZoom={2}
      >
        {useERDStore((state) => state.showGrid) && (
          <Background gap={20} size={1} color="#555" style={{ opacity: 0.5 }} />
        )}
        <ZoomToolbar />
        <ActionToolbar />
      </ReactFlow>
    </div>
  );
}
