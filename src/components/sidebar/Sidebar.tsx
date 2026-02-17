"use client";

import { useERDStore } from "@/store/erdStore";
import { HistoryView } from "./HistoryView";
import { ChatView } from "./ChatView";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { clsx } from "clsx";
import { useSession, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SQLEditor } from "../editor/SQLEditor";
import { Code } from "lucide-react";

export function Sidebar() {
  const sidebarOpen = useERDStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);
  const currentView = useERDStore((state) => state.currentView);
  const setCurrentView = useERDStore((state) => state.setCurrentView);
  const createNewChat = useERDStore((state) => state.createNewChat);

  const sidebarMode = useERDStore((state) => state.sidebarMode);
  const setSidebarMode = useERDStore((state) => state.setSidebarMode);

  const { data: session } = useSession();

  return (
    <aside
      className={clsx(
        "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 relative z-50",
        sidebarOpen
          ? currentView === "chat"
            ? "w-[450px]"
            : "w-[300px]"
          : "w-[60px]",
      )}
    >
      {/* Sidebar Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <h1
            className={clsx(
              "font-bold text-lg text-text-primary tracking-tight transition-opacity duration-200",
              sidebarOpen ? "opacity-100" : "opacity-0",
            )}
          >
            Showit
          </h1>
        </div>

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Unified Tab Switcher (Only in Chat Mode) */}
      <div
        className={clsx(
          "flex items-center p-2 gap-1 border-b border-border bg-sidebar shrink-0 overflow-hidden transition-all duration-300",
          sidebarOpen && currentView === "chat"
            ? "opacity-100 max-h-[53px]"
            : "opacity-0 max-h-0 py-0 border-none",
        )}
      >
        <button
          onClick={() => setSidebarMode("chat")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
            sidebarMode === "chat"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5",
          )}
        >
          <MessageSquare className="w-4 h-4" />
          AI Chat
        </button>
        <button
          onClick={() => setSidebarMode("editor")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
            sidebarMode === "editor"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5",
          )}
        >
          <Code className="w-4 h-4" />
          Editor
        </button>
      </div>

      {!sidebarOpen && (
        <div className="absolute top-14 left-0 w-full flex flex-col items-center py-4 gap-4 z-20">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setSidebarOpen(true);
                    setCurrentView("history");
                  }}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand Sidebar</TooltipContent>
            </Tooltip>

            {/* Quick Actions for Collapsed Mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setSidebarOpen(true);
                    setSidebarMode("chat");
                    createNewChat();
                  }}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">New Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={clsx(
            "absolute inset-0 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* History View Layer (Always on top if active) */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-all duration-300",
              currentView === "history"
                ? "opacity-100 z-20 translate-x-0"
                : "opacity-0 pointer-events-none -translate-x-4",
            )}
          >
            <HistoryView />
          </div>

          {/* Chat View Layer */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-transform duration-300 ease-in-out backface-hidden",
              currentView === "chat"
                ? sidebarMode === "chat"
                  ? "translate-x-0"
                  : "-translate-x-full"
                : "translate-x-0", // Default position when covered by history
              currentView !== "chat" && "opacity-0 pointer-events-none", // Hide when in history
            )}
          >
            <ChatView />
          </div>

          {/* Editor View Layer */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-transform duration-300 ease-in-out backface-hidden",
              currentView === "chat"
                ? sidebarMode === "editor"
                  ? "translate-x-0"
                  : "translate-x-full"
                : "translate-x-full", // Default position when covered by history
              currentView !== "chat" && "opacity-0 pointer-events-none", // Hide when in history
            )}
          >
            <SQLEditor />
          </div>
        </div>
      </div>
    </aside>
  );
}
