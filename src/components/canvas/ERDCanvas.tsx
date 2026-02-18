"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  type NodeTypes,
  type EdgeTypes,
  ConnectionMode,
  type Connection,
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

type RelationType = "1:1" | "1:N" | "N:M";

const RELATION_OPTIONS: {
  type: RelationType;
  label: string;
  desc: string;
  color: string;
}[] = [
  { type: "1:1", label: "One to One", desc: "1 : 1", color: "#3b82f6" },
  { type: "1:N", label: "One to Many", desc: "1 : N", color: "#10b981" },
  { type: "N:M", label: "Many to Many", desc: "N : M", color: "#a855f7" },
];

export function ERDCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, addEdgeWithType } =
    useERDStore();
  const theme = useERDStore((state) => state.theme);

  // Relation type picker state
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null,
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Show picker when user connects two nodes
  const handleConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
  }, []);

  // Track mouse position for picker placement (unused but kept for future use)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    (window as any).__lastMousePos = { x: e.clientX, y: e.clientY };
  }, []);

  const handleSelectRelationType = (type: RelationType) => {
    if (pendingConnection) {
      addEdgeWithType(pendingConnection, type);
      setPendingConnection(null);
    }
  };

  const handleCancelPicker = () => {
    setPendingConnection(null);
  };

  // Close picker on outside click
  useEffect(() => {
    if (!pendingConnection) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPendingConnection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pendingConnection]);

  return (
    <div
      className="w-full h-full bg-background relative"
      onMouseMove={handleMouseMove}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
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

      {/* Relation Type Picker */}
      {pendingConnection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={handleCancelPicker}
        >
          <div
            ref={pickerRef}
            className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-text-primary mb-1">
              Pilih Tipe Relasi
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Hubungan antara dua tabel ini
            </p>

            <div className="flex flex-col gap-2">
              {RELATION_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleSelectRelationType(opt.type)}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    borderColor: `${opt.color}40`,
                    backgroundColor: `${opt.color}10`,
                  }}
                >
                  {/* Badge */}
                  <div
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
                    style={{
                      backgroundColor: `${opt.color}20`,
                      color: opt.color,
                      border: `1px solid ${opt.color}60`,
                    }}
                  >
                    {opt.desc}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">
                      {opt.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleCancelPicker}
              className="mt-3 w-full text-xs text-text-secondary hover:text-text-primary transition-colors py-1"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
