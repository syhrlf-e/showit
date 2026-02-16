"use client";

import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { useState } from "react";
import { clsx } from "clsx";

export function HistoryPanel() {
  const history = useERDStore((state) => state.history);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={clsx(
        "flex flex-col border-t border-border transition-all duration-300",
        isCollapsed ? "h-auto" : "h-1/3 min-h-[200px]",
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between hover:bg-card/50 transition-colors"
      >
        <span>Recent Activity</span>
        {isCollapsed ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {history.length === 0 ? (
            <div className="text-center text-text-secondary text-xs py-4">
              No history yet
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                    <Download className="w-3 h-3 text-primary" />
                  </button>
                </div>
                <p className="text-sm text-text-primary line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
