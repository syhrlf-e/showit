"use client";

import { useState } from "react";
import { Sparkles, FileCode, MessageSquare, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { LoadingDots } from "@/components/ui/LoadingDots";

import { useERDStore } from "@/store/erdStore";

export function InputSection() {
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setIsGenerating = useERDStore((state) => state.setIsGenerating);
  const addToHistory = useERDStore((state) => state.addToHistory);
  const importSQL = useERDStore((state) => state.importSQL);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      if (mode === "sql") {
        // Direct SQL import
        importSQL(input);
        addToHistory({
          id: crypto.randomUUID(),
          prompt: "Import SQL",
          timestamp: Date.now(),
        });
        setInput("");
      } else {
        // Generate SQL from Natural Language via AI
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate SQL");
        }

        const generatedSQL = data.sql;
        importSQL(generatedSQL);
        addToHistory({
          id: crypto.randomUUID(),
          prompt: input,
          timestamp: Date.now(),
        });
        setInput("");
      }
    } catch (err: unknown) {
      console.error("Generation Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
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
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          placeholder={
            mode === "natural"
              ? "Describe your database... (e.g., 'Create a blog system with users, posts, and comments')"
              : "Paste your SQL CREATE TABLE statements here..."
          }
          className={clsx(
            "w-full h-32 bg-background border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
            error ? "border-red-500 ring-red-500/20" : "border-border",
          )}
        />

        {error && (
          <div className="absolute bottom-14 left-3 right-3 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-text-secondary flex items-center gap-1">
              Generating <LoadingDots />
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !input.trim()}
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
