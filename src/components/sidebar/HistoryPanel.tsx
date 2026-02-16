"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function HistoryPanel() {
  const messages = useERDStore((state) => state.messages);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={clsx(
        "flex flex-col border-b border-border transition-all duration-300 flex-1",
        isCollapsed ? "h-10 grow-0" : "h-full",
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between hover:bg-card/50 transition-colors"
      >
        <span>Chat History</span>
        {isCollapsed ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-text-secondary text-xs py-4">
              Start chatting to generate tables...
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "p-2 rounded-lg text-sm",
                  msg.role === "user"
                    ? "bg-primary/10 text-text-primary self-end ml-4 border border-primary/20"
                    : "bg-card border border-border text-text-secondary self-start mr-4",
                )}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-[10px] font-bold uppercase opacity-70">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                  <span className="text-[10px] opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
