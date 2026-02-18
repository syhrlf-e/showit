"use client";

import { useERDStore } from "@/store/erdStore";
import { HistoryView } from "./HistoryView";
import { ChatView } from "./ChatView";
import { ValidationPanel } from "./ValidationPanel";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  User,
  ShieldCheck,
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
import { useERDValidation } from "@/hooks/useERDValidation";

export function Sidebar() {
  const sidebarOpen = useERDStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);
  const currentView = useERDStore((state) => state.currentView);
  const setCurrentView = useERDStore((state) => state.setCurrentView);
  const createNewChat = useERDStore((state) => state.createNewChat);

  const sidebarMode = useERDStore((state) => state.sidebarMode);
  const setSidebarMode = useERDStore((state) => state.setSidebarMode);

  const { data: session } = useSession();
  const { errorCount, warningCount } = useERDValidation();
  const totalIssues = errorCount + warningCount;

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
          "flex items-center p-2 gap-1 border-b border-border bg-sidebar shrink-0 overflow-hidden transition-all duration-200 ease-in-out",
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
          Smart Chat
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
          Editor
        </button>
        <button
          onClick={() => setSidebarMode("validation")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap relative",
            sidebarMode === "validation"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5",
          )}
        >
          Validasi
          {/* Badge for issues */}
          {totalIssues > 0 && (
            <span
              className={clsx(
                "absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center",
                errorCount > 0
                  ? "bg-red-500 text-white"
                  : "bg-amber-500 text-white",
              )}
            >
              {totalIssues}
            </span>
          )}
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

            {/* Validation shortcut in collapsed mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setSidebarOpen(true);
                    setCurrentView("chat");
                    setSidebarMode("validation");
                  }}
                  className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {totalIssues > 0 && (
                    <span
                      className={clsx(
                        "absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center",
                        errorCount > 0
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white",
                      )}
                    >
                      {totalIssues}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Validasi Schema</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={clsx(
            "absolute inset-0 transition-opacity duration-200 ease-in-out",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* History View Layer (Always on top if active) */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-transform duration-200 ease-in-out",
              currentView === "history" ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <HistoryView />
          </div>

          {/* Chat View Layer */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-transform duration-200 ease-in-out",
              currentView === "chat"
                ? sidebarMode === "chat"
                  ? "translate-x-0"
                  : "-translate-x-full"
                : "translate-x-0",
              currentView !== "chat" && "opacity-0 pointer-events-none",
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
                  : sidebarMode === "validation"
                    ? "-translate-x-full"
                    : "translate-x-full"
                : "translate-x-full",
              currentView !== "chat" && "opacity-0 pointer-events-none",
            )}
          >
            <SQLEditor />
          </div>

          {/* Validation View Layer */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col bg-sidebar transition-transform duration-300 ease-in-out",
              currentView === "chat"
                ? sidebarMode === "validation"
                  ? "translate-x-0"
                  : "translate-x-full"
                : "translate-x-full",
              currentView !== "chat" && "opacity-0 pointer-events-none",
            )}
          >
            <ValidationPanel />
          </div>
        </div>
      </div>
    </aside>
  );
}
