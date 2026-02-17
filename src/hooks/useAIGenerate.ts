"use client";

import { useState } from "react";
import { useERDStore } from "@/store/erdStore";

export function useAIGenerate() {
  const [error, setError] = useState<string | null>(null);
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setIsGenerating = useERDStore((state) => state.setIsGenerating);
  const addMessage = useERDStore((state) => state.addMessage);
  const importSQL = useERDStore((state) => state.importSQL);
  const setPendingSQL = useERDStore((state) => state.setPendingSQL);
  const setSidebarMode = useERDStore((state) => state.setSidebarMode);

  const generate = async (
    input: string,
    mode: "natural" | "sql",
    onSuccess?: () => void,
  ) => {
    if (!input.trim()) return;

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
        setPendingSQL(input);
        setSidebarMode("editor");

        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "SQL ready for review. Please check the Editor.",
          timestamp: Date.now(),
        });
      } else {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate SQL");
        }

        setPendingSQL(data.sql);
        setSidebarMode("editor");

        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: "Generated schema. Please review changes in the Editor.",
          timestamp: Date.now(),
        });
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error("Generation Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);

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

  return { generate, error, isGenerating, setError };
}
