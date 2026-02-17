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
  const createNewChat = useERDStore((state) => state.createNewChat);

  const sidebarMode = useERDStore((state) => state.sidebarMode);
  const setSidebarMode = useERDStore((state) => state.setSidebarMode);

  const { data: session } = useSession();

  return (
    <aside
      className={clsx(
        "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 relative z-50",
        sidebarOpen ? "w-[350px]" : "w-[60px]",
      )}
    >
      {/* Sidebar Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-lg text-text-primary tracking-tight">
              Showit
            </h1>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Database className="w-5 h-5 text-primary" />
            </div>
          </div>
        )}

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
      {sidebarOpen && currentView === "chat" && (
        <div className="flex items-center p-2 gap-1 border-b border-border bg-sidebar shrink-0">
          <button
            onClick={() => setSidebarMode("chat")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
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
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              sidebarMode === "editor"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5",
            )}
          >
            <Code className="w-4 h-4" />
            Editor
          </button>
        </div>
      )}

      {!sidebarOpen && (
        <div className="absolute top-14 left-0 w-full flex flex-col items-center py-4 gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarOpen(true)}
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
      <div
        className={clsx(
          "flex-1 overflow-hidden relative",
          !sidebarOpen && "hidden",
        )}
      >
        {/* History View Layer (Always on top if active) */}
        <div
          className={clsx(
            "absolute inset-0 flex flex-col bg-sidebar transition-opacity",
            currentView === "history"
              ? "opacity-100 z-20"
              : "opacity-0 pointer-events-none",
          )}
        >
          <HistoryView />
        </div>

        {/* Chat View Layer */}
        <div
          className={clsx(
            "absolute inset-0 flex flex-col bg-sidebar transition-opacity",
            currentView === "chat" && sidebarMode === "chat"
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ChatView />
        </div>

        {/* Editor View Layer */}
        <div
          className={clsx(
            "absolute inset-0 flex flex-col bg-sidebar transition-opacity",
            currentView === "chat" && sidebarMode === "editor"
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none",
          )}
        >
          <SQLEditor />
        </div>
      </div>

      {/* Footer (User Profile) */}
      {sidebarOpen && (
        <div className="p-3 border-t border-border bg-sidebar shrink-0">
          {session ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left outline-none">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full border border-border/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-text-secondary truncate opacity-70">
                      {session.user?.email || "No email"}
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-text-secondary" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 mb-2 ml-2"
                  side="top"
                  align="start"
                  sideOffset={10}
                >
                  <DropdownMenu.Label className="text-xs font-semibold text-text-secondary px-2 py-1.5">
                    My Account
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item
                    onSelect={() => signOut()}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg outline-none cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Log in</span>
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
