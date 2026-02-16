"use client";

import { useState } from "react";
import { AlertTriangle, PanelLeftClose, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { LoadingDots } from "@/components/ui/LoadingDots";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useERDStore } from "@/store/erdStore";

export function InputSection() {
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setIsGenerating = useERDStore((state) => state.setIsGenerating);
  const addMessage = useERDStore((state) => state.addMessage);
  const importSQL = useERDStore((state) => state.importSQL);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    // Add user message immediately
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    });

    setIsGenerating(true);
    setError(null);

    try {
      if (mode === "sql") {
        // Direct SQL import
        importSQL(input);
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "Imported SQL successfully.",
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

        // Add AI response to chat
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "Generated tables based on your request.",
          timestamp: Date.now(),
        });

        setInput("");
      }
    } catch (err: unknown) {
      console.error("Generation Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);

      // Optional: Add error message to chat
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        content: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border bg-card/30">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">
          Drop your ideas here
        </h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
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
            "w-full h-32 bg-background border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors pb-12",
            error ? "border-red-500 ring-red-500/20" : "border-border",
          )}
        />

        {error && (
          <div className="absolute bottom-14 left-3 right-3 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-card border border-border rounded-md hover:bg-card/80 transition-colors">
                {mode === "natural" ? "Natural" : "SQL"}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[100px] bg-card border border-border rounded-md shadow-lg p-1 z-50 animate-in fade-in zoom-in-95"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Item
                  className={clsx(
                    "px-2 py-1.5 text-xs rounded-sm outline-none cursor-pointer",
                    mode === "natural"
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                  )}
                  onSelect={() => setMode("natural")}
                >
                  Natural
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={clsx(
                    "px-2 py-1.5 text-xs rounded-sm outline-none cursor-pointer",
                    mode === "sql"
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                  )}
                  onSelect={() => setMode("sql")}
                >
                  SQL
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div className="flex items-center gap-2">
            {isGenerating && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <LoadingDots />
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-lg shadow-primary/20"
            >
              {isGenerating ? "Processing..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
