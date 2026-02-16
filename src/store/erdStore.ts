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
}

export const useERDStore = create<ERDState>()(
  persist(
    (set, get) => ({
      history: [],
      isGenerating: false,
      addToHistory: (entry) =>
        set({ history: [entry, ...get().history].slice(0, 50) }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      nodes: [
        {
          id: "1",
          type: "table",
          position: { x: 100, y: 100 },
          data: {
            label: "Users",
            columns: [
              {
                id: "c1",
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: "c2",
                name: "email",
                type: "varchar(255)",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: "c3",
                name: "created_at",
                type: "timestamp",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
            ],
          },
        },
        {
          id: "2",
          type: "table",
          position: { x: 500, y: 100 },
          data: {
            label: "Posts",
            columns: [
              {
                id: "p1",
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: "p2",
                name: "user_id",
                type: "uuid",
                isPrimaryKey: false,
                isForeignKey: true,
                isNullable: false,
              },
              {
                id: "p3",
                name: "title",
                type: "varchar(255)",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: "p4",
                name: "content",
                type: "text",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: true,
              },
            ],
          },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "1",
          target: "2",
          type: "relationship",
          data: { label: "has many", type: "1:N" },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ],
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
    }),
    {
      name: "erd-storage",
    },
  ),
);
