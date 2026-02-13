"use client";

import { useState } from "react";
import { Sparkles, FileCode, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import { LoadingDots } from "../ui/LoadingDots";

export function InputSection() {
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border bg-card/30">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Generator
        </h2>
        <div className="flex bg-background rounded-lg p-1 border border-border">
          <button
            onClick={() => setMode("natural")}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
              mode === "natural"
                ? "bg-primary text-white shadow"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <MessageSquare className="w-3 h-3" />
            Natural
          </button>
          <button
            onClick={() => setMode("sql")}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
              mode === "sql"
                ? "bg-primary text-white shadow"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <FileCode className="w-3 h-3" />
            SQL
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "natural"
              ? "Describe your database... (e.g., 'Create a blog system with users, posts, and comments')"
              : "CREATE TABLE users (...);"
          }
          className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-secondary flex items-center gap-1">
              Generating <LoadingDots />
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? "Processing..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
