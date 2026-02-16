"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  LogOut,
  User,
  Settings,
  MoreHorizontal,
  Database,
} from "lucide-react";
import { clsx } from "clsx";
import { ChatDialog } from "../chat/ChatDialog";
import { useSession, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useERDStore } from "@/store/erdStore";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { data: session } = useSession();
  const setMessages = useERDStore((state) => state.setMessages);
  const messages = useERDStore((state) => state.messages);

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <>
      <aside className="h-full relative z-50 group">
        <div className="w-16 h-full bg-sidebar border-r border-border flex flex-col items-center py-2" />

        <div
          className={clsx(
            "fixed top-0 bottom-0 left-0 bg-sidebar border-r border-border flex flex-col transition-all duration-300 shadow-2xl z-50",
            isCollapsed ? "w-16" : "w-64",
          )}
        >
          <div className="h-14 flex items-center justify-between px-3 border-b border-border/50">
            <div
              className={clsx(
                "flex items-center gap-2 transition-all",
                isCollapsed ? "justify-center w-full" : "",
              )}
            >
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-3 flex flex-col gap-2">
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="flex justify-center p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNewChat}
              className={clsx(
                "flex items-center gap-2 rounded-lg border border-border/50 hover:bg-white/5 transition-all text-sm font-medium text-text-primary",
                isCollapsed
                  ? "p-2 justify-center"
                  : "w-full px-3 py-2 bg-card/50",
              )}
              title="New Chat"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>New Chat</span>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div
              className={clsx(
                "px-3 py-1 text-xs font-medium text-text-secondary/50",
                isCollapsed && "text-center",
              )}
            >
              {isCollapsed ? "•" : "Recent"}
            </div>
            {messages.length === 0 ? (
              <div
                className={clsx(
                  "px-3 py-2 text-xs text-text-secondary/40",
                  isCollapsed && "text-center",
                )}
              >
                {isCollapsed ? "—" : "No chat history yet"}
              </div>
            ) : (
              messages
                .filter((m) => m.role === "user")
                .slice(-5)
                .reverse()
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="px-2"
                    title={isCollapsed ? msg.content : undefined}
                  >
                    <div
                      className={clsx(
                        "w-full flex items-center gap-3 p-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors group",
                        isCollapsed && "justify-center",
                      )}
                    >
                      <History className="w-4 h-4 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex flex-col items-start overflow-hidden text-left flex-1 min-w-0">
                          <span className="text-sm truncate w-full group-hover:text-primary transition-colors">
                            {msg.content.slice(0, 40)}
                            {msg.content.length > 40 ? "..." : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="p-3 border-t border-border/50">
            {session ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className={clsx(
                      "flex items-center gap-3 w-full rounded-xl hover:bg-white/5 transition-colors text-left outline-none",
                      isCollapsed ? "p-1 justify-center" : "p-2",
                    )}
                  >
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

                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-text-secondary truncate opacity-70">
                            {session.user?.email || "No email"}
                          </p>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                      </>
                    )}
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 mb-2 ml-2"
                    side="right"
                    align="end"
                    sideOffset={10}
                  >
                    <DropdownMenu.Label className="text-xs font-semibold text-text-secondary px-2 py-1.5">
                      My Account
                    </DropdownMenu.Label>
                    <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg outline-none cursor-pointer hover:bg-white/5 text-text-primary">
                      <Settings className="w-4 h-4" />
                      Settings
                    </DropdownMenu.Item>
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
                className={clsx(
                  "flex items-center gap-3 w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors",
                  isCollapsed ? "p-2 justify-center" : "px-4 py-2.5",
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium">Log in</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </aside>
      <ChatDialog />
    </>
  );
}
