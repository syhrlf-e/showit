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
import { type TableData, type Column, type ChatMessage } from "../types/erd";
import dagre from "dagre";
import { parseSQLToERD } from "@/utils/sqlParser";
import { DEFAULT_NODES, DEFAULT_EDGES } from "@/constants/defaults";
import { toast } from "sonner";

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
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
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
      messages: [],
      isGenerating: false,
      addMessage: (message) => set({ messages: [...get().messages, message] }),
      setMessages: (messages) => set({ messages }),
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
                x: nodeWithPosition.x - 120,
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
          const { nodes: newNodes, edges: newEdges } = parseSQLToERD(sql);

          if (newNodes.length === 0) {
            toast.warning("No valid tables found in SQL");
            return;
          }

          const currentNodes = get().nodes;
          const currentEdges = get().edges;

          const mergedNodes = [...currentNodes];
          let newNodesCount = 0;

          newNodes.forEach((newNode) => {
            const existingNodeIndex = mergedNodes.findIndex(
              (n) => n.data.label === newNode.data.label,
            );

            if (existingNodeIndex !== -1) {
              mergedNodes[existingNodeIndex] = {
                ...mergedNodes[existingNodeIndex],
                data: {
                  ...mergedNodes[existingNodeIndex].data,
                  columns: newNode.data.columns,
                },
              };
            } else {
              mergedNodes.push({
                ...newNode,
                data: {
                  ...newNode.data,
                  animationDelay: newNodesCount * 0.15,
                },
              });
              newNodesCount++;
            }
          });

          const mergedEdges = [...currentEdges];

          newEdges.forEach((newEdge) => {
            const exists = mergedEdges.some(
              (e) =>
                (e.source === newEdge.source && e.target === newEdge.target) ||
                (e.source === newEdge.target && e.target === newEdge.source),
            );

            if (!exists) {
              mergedEdges.push(newEdge);
            }
          });

          set({
            nodes: mergedNodes,
            edges: mergedEdges,
            isGenerating: false,
          });

          get().layoutNodes();

          toast.success(`Imported ${newNodes.length} tables successfully`);
        } catch (error) {
          console.error("Import Error:", error);
          toast.error("Failed to import SQL");
          set({ isGenerating: false });
        }
      },
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "erd-storage-mysql",
    },
  ),
);
