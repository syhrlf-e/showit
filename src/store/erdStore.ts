import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import { type TableData, type Column } from "../types/erd";
import dagre from "dagre";
import { parseSQLToERD } from "@/utils/sqlParser";
import { DEFAULT_NODES, DEFAULT_EDGES } from "@/lib/constants";
import { toast } from "sonner";

/**
 * Interface representing the state and actions of the ERD Store.
 */
interface ERDState {
  nodes: Node<TableData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<TableData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<TableData>) => void;
  updateNode: (id: string, data: Partial<TableData>) => void;
  deleteNode: (id: string) => void;
  addColumn: (nodeId: string) => void;
  updateColumn: (
    nodeId: string,
    columnId: string,
    data: Partial<Column>,
  ) => void;
  removeColumn: (nodeId: string, columnId: string) => void;
  history: { id: string; prompt: string; timestamp: number }[];
  addToHistory: (entry: {
    id: string;
    prompt: string;
    timestamp: number;
  }) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  layoutNodes: () => void;
  showGrid: boolean;
  toggleGrid: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  sqlMode: "visual" | "code";
  setSqlMode: (mode: "visual" | "code") => void;
  sqlCode: string;
  setSqlCode: (code: string) => void;
  importSQL: (sql: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useERDStore = create<ERDState>()(
  persist(
    (set, get) => ({
      history: [],
      isGenerating: false,
      addToHistory: (entry) =>
        set({ history: [entry, ...get().history].slice(0, 50) }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection: Connection) => {
        const edge: Edge = {
          ...connection,
          id: `e${connection.source}-${connection.target}-${Date.now()}`,
          type: "relationship",
          data: { label: "has many", type: "1:N" },
          markerEnd: { type: MarkerType.ArrowClosed },
        };
        set({
          edges: addEdge(edge, get().edges),
        });
      },
      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },
      updateNode: (id, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, ...data } }
              : node,
          ),
        });
      },
      deleteNode: (id) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== id),
          edges: get().edges.filter(
            (edge) => edge.source !== id && edge.target !== id,
          ),
        });
      },
      addColumn: (nodeId) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              const newColumn: Column = {
                id: crypto.randomUUID(),
                name: "new_column",
                type: "varchar",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: true,
              };
              return {
                ...node,
                data: {
                  ...node.data,
                  columns: [...node.data.columns, newColumn],
                },
              };
            }
            return node;
          }),
        });
      },
      updateColumn: (nodeId, columnId, data) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  columns: node.data.columns.map((col) =>
                    col.id === columnId ? { ...col, ...data } : col,
                  ),
                },
              };
            }
            return node;
          }),
        });
      },
      removeColumn: (nodeId, columnId) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  columns: node.data.columns.filter(
                    (col) => col.id !== columnId,
                  ),
                },
              };
            }
            return node;
          }),
        });
      },
      layoutNodes: () => {
        const { nodes, edges } = get();
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: "LR" });
        g.setDefaultEdgeLabel(() => ({}));

        nodes.forEach((node) => {
          g.setNode(node.id, {
            width: 240,
            height: 100 + node.data.columns.length * 32,
          });
        });

        edges.forEach((edge) => {
          g.setEdge(edge.source, edge.target);
        });

        dagre.layout(g);

        set({
          nodes: nodes.map((node) => {
            const nodeWithPosition = g.node(node.id);
            return {
              ...node,
              position: {
                x: nodeWithPosition.x - 120, // Center offset
                y:
                  nodeWithPosition.y -
                  (100 + node.data.columns.length * 32) / 2,
              },
            };
          }),
        });
      },
      showGrid: true,
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      theme: "dark",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      sqlMode: "visual",
      setSqlMode: (mode) => set({ sqlMode: mode }),
      sqlCode: "",
      setSqlCode: (code) => set({ sqlCode: code }),
      importSQL: (sql) => {
        try {
          const { nodes: parsedNodes } = parseSQLToERD(sql);
          if (parsedNodes.length > 0) {
            const currentNodes = get().nodes;
            const currentEdges = get().edges;

            // Smart merge: match by table name, preserve id & position
            const mergedNodes = parsedNodes.map((parsedNode, index) => {
              const tableName = parsedNode.data.label.toLowerCase();
              const existingNode = currentNodes.find(
                (n) => n.data.label.toLowerCase() === tableName,
              );

              if (existingNode) {
                // Update columns only, keep id and position
                return {
                  ...existingNode,
                  data: {
                    ...existingNode.data,
                    columns: parsedNode.data.columns,
                  },
                };
              }

              // New table, give it a position
              return {
                ...parsedNode,
                position: { x: 100 + index * 300, y: 100 },
              };
            });

            set({ nodes: mergedNodes, edges: currentEdges, sqlCode: sql });
            toast.success("SQL imported successfully");
          } else {
            toast.warning("No tables found in SQL");
          }
        } catch (error) {
          console.error("Failed to import SQL", error);
          toast.error("Failed to import SQL. Check syntax.");
        }
      },
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "erd-storage-mysql", // Changed from 'erd-storage' to force fresh start
    },
  ),
);
