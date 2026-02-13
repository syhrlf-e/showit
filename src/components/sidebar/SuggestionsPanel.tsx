"use client";

import { Lightbulb, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function SuggestionsPanel() {
  const [isOpen, setIsOpen] = useState(true);

  const suggestions = [
    { id: 1, title: "Add indexes to foreign keys", type: "performance" },
    { id: 2, title: "Normalize User address fields", type: "normalization" },
  ];

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lightbulb className="w-4 h-4" />
          AI Suggestions
          <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
            2
          </span>
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-text-secondary transition-transform",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>

      {isOpen && (
        <div className="px-2 pb-4 flex flex-col gap-2">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-primary/10 rounded-md text-primary mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm text-text-primary font-medium mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-secondary capitalize">
                    {item.type} Tip
                  </p>
                </div>
              </div>
              <button className="w-full mt-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <Check className="w-3 h-3" />
                Apply Fix
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
