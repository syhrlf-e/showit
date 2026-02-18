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
import {
  type TableData,
  type Column,
  type ChatMessage,
  type ChatSession,
} from "../types/erd";
import dagre from "dagre";
import { parseSQLToERD } from "@/utils/sqlParser";
import { DEFAULT_NODES, DEFAULT_EDGES } from "@/constants/defaults";
import { toast } from "sonner";

interface ERDState {
  nodes: Node<TableData>[];
  edges: Edge[];
  setNodes: (nodes: Node<TableData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange<Node<TableData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addEdgeWithType: (
    connection: Connection,
    relationType: "1:1" | "1:N" | "N:M",
  ) => void;
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

  // Chat Session Management
  currentView: "history" | "chat";
  setCurrentView: (view: "history" | "chat") => void;
  currentChatId: string | null;
  sessions: ChatSession[];
  saveCurrentSession: () => void;
  createNewChat: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  layoutNodes: () => void;
  showGrid: boolean;
  toggleGrid: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Unified Sidebar Mode
  sidebarMode: "chat" | "editor" | "validation";
  setSidebarMode: (mode: "chat" | "editor" | "validation") => void;

  // SQL Editor State
  sqlMode: "visual" | "code";
  setSqlMode: (mode: "visual" | "code") => void;
  sqlCode: string;
  setSqlCode: (code: string) => void;
  pendingSQL: string | null;
  setPendingSQL: (code: string | null) => void;
  importSQL: (sql: string) => void;
  syncSQL: (sql: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useERDStore = create<ERDState>()(
  persist(
    (set, get) => ({
      messages: [],
      currentView: "history",
      setCurrentView: (view) => set({ currentView: view }),
      currentChatId: null,
      sessions: [],

      sidebarMode: "chat",
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      pendingSQL: null,
      setPendingSQL: (code) => set({ pendingSQL: code }),

      // Helper: Save current session state before switching
      saveCurrentSession: () => {
        const state = get();
        if (!state.currentChatId) return;

        set({
          sessions: state.sessions.map((session) =>
            session.id === state.currentChatId
              ? {
                  ...session,
                  messages: state.messages,
                  nodes: state.nodes,
                  edges: state.edges,
                  sqlCode: state.sqlCode,
                  timestamp: Date.now(),
                }
              : session,
          ),
        });
      },

      createNewChat: () => {
        // 1. Save current session state before clearing
        const state = get();
        if (state.currentChatId) {
          get().saveCurrentSession();
        }

        // 2. Create new session
        const newSessionId = crypto.randomUUID();
        const newSession: ChatSession = {
          id: newSessionId,
          title: "New Chat",
          timestamp: Date.now(),
          preview: "Empty conversation",
          messages: [],
          nodes: [],
          edges: [],
          sqlCode: "",
        };

        // 3. Clear canvas and set new session
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentChatId: newSessionId,
          messages: [],
          nodes: [],
          edges: [],
          sqlCode: "",
          pendingSQL: null,
          currentView: "chat",
        }));
      },

      loadSession: (sessionId) => {
        // 1. Save current session before switching
        const currentState = get();
        if (currentState.currentChatId) {
          get().saveCurrentSession();
        }

        // 2. Find and load target session
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          // 3. Restore full state from session
          set({
            currentChatId: sessionId,
            messages: session.messages,
            nodes: session.nodes || [],
            edges: session.edges || [],
            sqlCode: session.sqlCode || "",
            pendingSQL: null,
            currentView: "chat",
          });
        }
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentChatId:
            state.currentChatId === sessionId ? null : state.currentChatId,
          messages: state.currentChatId === sessionId ? [] : state.messages,
          currentView:
            state.currentChatId === sessionId ? "history" : state.currentView,
        }));
      },

      isGenerating: false,

      addMessage: (message) => {
        const state = get();
        let chatId = state.currentChatId;
        let newSessions = [...state.sessions];

        if (!chatId) {
          // Auto-create session if sending message without active chat
          chatId = crypto.randomUUID();
          const newSession: ChatSession = {
            id: chatId,
            title: message.content.slice(0, 30) || "New Chat",
            timestamp: Date.now(),
            preview: message.content.slice(0, 50),
            messages: [message],
            nodes: [],
            edges: [],
            sqlCode: "",
          };
          newSessions = [newSession, ...newSessions];
        } else {
          // Update existing session
          newSessions = newSessions.map((session) => {
            if (session.id === chatId) {
              return {
                ...session,
                messages: [...session.messages, message],
                preview: message.content.slice(0, 50),
                timestamp: Date.now(),
                // Update title based on first user message if it's "New Chat"
                title:
                  session.title === "New Chat" && message.role === "user"
                    ? message.content.slice(0, 30)
                    : session.title,
              };
            }
            return session;
          });
        }

        set({
          sessions: newSessions,
          currentChatId: chatId,
          messages:
            chatId === state.currentChatId
              ? [...state.messages, message]
              : state.messages,
        });
      },

      setMessages: (messages) => {
        const chatId = get().currentChatId;
        if (chatId) {
          set((state) => ({
            messages,
            sessions: state.sessions.map((s) =>
              s.id === chatId ? { ...s, messages } : s,
            ),
          }));
        } else {
          set({ messages });
        }
      },

      setIsGenerating: (isGenerating) => set({ isGenerating }),
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
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
          data: { label: "1 to many", type: "1:N" },
          markerEnd: { type: MarkerType.ArrowClosed },
        };
        set({
          edges: addEdge(edge, get().edges),
        });
      },
      addEdgeWithType: (
        connection: Connection,
        relationType: "1:1" | "1:N" | "N:M",
      ) => {
        const labelMap = {
          "1:1": "one to one",
          "1:N": "one to many",
          "N:M": "many to many",
        };
        const edge: Edge = {
          ...connection,
          id: `e${connection.source}-${connection.target}-${Date.now()}`,
          type: "relationship",
          data: { label: labelMap[relationType], type: relationType },
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
        if (nodes.length === 0) return;

        // If no edges (disconnected tables), use a clean grid layout
        if (edges.length === 0) {
          const COLS = Math.ceil(Math.sqrt(nodes.length)); // e.g. 5 tables → 3 cols
          const COL_WIDTH = 300;
          const ROW_HEIGHT = 350;

          set({
            nodes: nodes.map((node, index) => ({
              ...node,
              position: {
                x: (index % COLS) * COL_WIDTH + 50,
                y: Math.floor(index / COLS) * ROW_HEIGHT + 50,
              },
            })),
          });
          return;
        }

        // If edges exist, use dagre for relationship-aware layout
        const g = new dagre.graphlib.Graph();
        g.setGraph({
          rankdir: "LR",
          nodesep: 80,
          ranksep: 250,
        });
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

          // Map: parser node ID → final merged node ID
          const idRemap: Record<string, string> = {};

          newNodes.forEach((newNode) => {
            const existingNodeIndex = mergedNodes.findIndex(
              (n) => n.data.label === newNode.data.label,
            );

            if (existingNodeIndex !== -1) {
              // Existing node: remap parser ID → existing ID
              idRemap[newNode.id] = mergedNodes[existingNodeIndex].id;
              mergedNodes[existingNodeIndex] = {
                ...mergedNodes[existingNodeIndex],
                data: {
                  ...mergedNodes[existingNodeIndex].data,
                  columns: newNode.data.columns,
                },
              };
            } else {
              // New node: keep parser ID, remap to itself
              idRemap[newNode.id] = newNode.id;
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

          // Remap edges to use correct merged node IDs
          const mergedEdges = [...currentEdges];
          newEdges.forEach((newEdge) => {
            const remappedSource = idRemap[newEdge.source] ?? newEdge.source;
            const remappedTarget = idRemap[newEdge.target] ?? newEdge.target;

            const exists = mergedEdges.some(
              (e) =>
                (e.source === remappedSource && e.target === remappedTarget) ||
                (e.source === remappedTarget && e.target === remappedSource),
            );

            if (!exists) {
              mergedEdges.push({
                ...newEdge,
                source: remappedSource,
                target: remappedTarget,
              });
            }
          });

          set({
            nodes: mergedNodes,
            edges: mergedEdges,
            isGenerating: false,
          });

          // Delay layout to ensure React Flow has rendered the nodes
          setTimeout(() => {
            get().layoutNodes();
          }, 100);

          toast.success(`Imported ${newNodes.length} tables successfully`);
        } catch (error) {
          console.error("Import Error:", error);
          toast.error("Failed to import SQL");
          set({ isGenerating: false });
        }
      },
      syncSQL: (sql) => {
        try {
          const { nodes: newNodes, edges: newEdges } = parseSQLToERD(sql);

          if (newNodes.length === 0 && sql.trim() === "") {
            set({ nodes: [], edges: [] });
            return;
          }

          const currentNodes = get().nodes;

          // Merged Nodes Logic
          const nextNodes = [...currentNodes];

          // 1. Update Existing & Add New
          newNodes.forEach((newNode) => {
            const index = nextNodes.findIndex(
              (n) => n.data.label === newNode.data.label,
            );

            if (index !== -1) {
              // Update existing node (preserve ID and Position)
              nextNodes[index] = {
                ...nextNodes[index],
                data: {
                  ...nextNodes[index].data,
                  columns: newNode.data.columns,
                },
              };
            } else {
              // Add new node
              nextNodes.push(newNode);
            }
          });

          // 2. Remove Deleted Nodes
          const finalNodes = nextNodes.filter((n) =>
            newNodes.some((newNode) => newNode.data.label === n.data.label),
          );

          set({
            nodes: finalNodes,
            edges: newEdges,
          });
        } catch {
          // Suppress syntax errors during typing as they are expected.
          // We could add a state 'isSyntaxError' to the store if we want to show UI feedback.
          // For now, just silently fail to sync, keeping the old valid state.
        }
      },
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "erd-storage-mysql",
      storage: {
        getItem: (name) => {
          // Dynamically choose storage based on auth
          const hasAuth =
            typeof window !== "undefined" &&
            Object.keys(localStorage).some((key) =>
              key.startsWith("next-auth"),
            );
          const storage = hasAuth ? localStorage : sessionStorage;
          const str = storage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          // Dynamically choose storage based on auth
          const hasAuth =
            typeof window !== "undefined" &&
            Object.keys(localStorage).some((key) =>
              key.startsWith("next-auth"),
            );
          const storage = hasAuth ? localStorage : sessionStorage;
          storage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          // Clear from both storages
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
          }
        },
      },
    },
  ),
);
