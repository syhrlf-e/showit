"use client";

import { useState } from "react";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import { MarkerType } from "@xyflow/react";

export function useAIGenerate() {
  const [error, setError] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
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
        // Detect language from prompt (simple heuristic)
        const isIndonesian =
          /\b(buat|buatkan|generate|tabel|database|skema|tambah|ubah|hapus)\b/i.test(
            input,
          );

        // Add processing message
        const processingMessageId = crypto.randomUUID();
        addMessage({
          id: processingMessageId,
          role: "assistant",
          content: isIndonesian
            ? "⏳ Sedang membuat SQL schema..."
            : "⏳ Generating SQL schema...",
          timestamp: Date.now(),
        });

        // Get current schema to send as context
        const currentState = useERDStore.getState();
        const currentSchema =
          currentState.nodes.length > 0
            ? generateSQL(currentState.nodes, currentState.edges)
            : undefined;

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input, currentSchema }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate SQL");
        }

        // Remove processing message and add completion message
        const messages = useERDStore.getState().messages;
        const filteredMessages = messages.filter(
          (m) => m.id !== processingMessageId,
        );
        useERDStore.getState().setMessages(filteredMessages);

        const currentNodes = useERDStore.getState().nodes;

        if (currentNodes.length === 0) {
          // First generation: Auto-apply and stay in chat
          importSQL(data.sql);
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: isIndonesian
              ? "SQL schema berhasil dibuat dan diterapkan ke canvas. Kamu bisa minta perubahan lebih lanjut!"
              : "SQL schema created and applied to the canvas. You can now request further refinements!",
            timestamp: Date.now(),
          });
        } else {
          // Subsequent generations: Require approval
          setPendingSQL(data.sql);
          setSidebarMode("editor");
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: isIndonesian
              ? "SQL schema berhasil dibuat. Silakan cek tab **Editor** untuk review dan terapkan perubahan."
              : "SQL schema generated. Please check the **Editor** tab to review and apply changes.",
            timestamp: Date.now(),
          });
        }
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

  /**
   * Ask AI to suggest missing relations for the current schema
   */
  const suggestRelations = async () => {
    const state = useERDStore.getState();
    if (state.nodes.length === 0) return;

    const isIndonesian = true; // Default to Indonesian for this app

    setIsSuggesting(true);

    const processingId = crypto.randomUUID();
    addMessage({
      id: processingId,
      role: "assistant",
      content: "🔍 Menganalisis schema untuk menemukan relasi yang hilang...",
      timestamp: Date.now(),
    });

    try {
      const currentSchema = generateSQL(state.nodes, state.edges);

      const response = await fetch("/api/ai/suggest-relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema: currentSchema }),
      });

      const data = await response.json();

      // Remove processing message
      const messages = useERDStore.getState().messages;
      useERDStore
        .getState()
        .setMessages(messages.filter((m) => m.id !== processingId));

      if (!response.ok) throw new Error(data.error);

      const suggestions: {
        source: string;
        target: string;
        type: "1:1" | "1:N" | "N:M";
        reason: string;
      }[] = data.suggestions || [];

      if (suggestions.length === 0) {
        addMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: isIndonesian
            ? "✅ Schema sudah lengkap! Tidak ada relasi yang hilang."
            : "✅ Schema looks complete! No missing relations found.",
          timestamp: Date.now(),
        });
        return;
      }

      // Apply suggestions to canvas
      const currentNodes = useERDStore.getState().nodes;
      const currentEdges = useERDStore.getState().edges;

      const newEdges = [...currentEdges];
      const appliedSuggestions: string[] = [];

      suggestions.forEach((suggestion) => {
        const sourceNode = currentNodes.find(
          (n) => n.data.label === suggestion.source,
        );
        const targetNode = currentNodes.find(
          (n) => n.data.label === suggestion.target,
        );

        if (!sourceNode || !targetNode) return;

        // Check if edge already exists
        const exists = newEdges.some(
          (e) =>
            (e.source === sourceNode.id && e.target === targetNode.id) ||
            (e.source === targetNode.id && e.target === sourceNode.id),
        );

        if (!exists) {
          const labelMap = {
            "1:1": "one to one",
            "1:N": "one to many",
            "N:M": "many to many",
          };

          // Find FK column in source (column named target_id or similar)
          const tLabel = targetNode.data.label.toLowerCase();
          const tSingular = tLabel.endsWith("s") ? tLabel.slice(0, -1) : tLabel;
          const fkCol = sourceNode.data.columns.find((c) => {
            const cn = c.name.toLowerCase();
            return (
              cn === `${tLabel}_id` ||
              cn === `${tSingular}_id` ||
              cn === `id_${tLabel}` ||
              cn === `id_${tSingular}`
            );
          });
          // Find PK column in target
          const pkCol = targetNode.data.columns.find((c) => c.isPrimaryKey);

          newEdges.push({
            id: `e-suggest-${sourceNode.id}-${targetNode.id}-${Date.now()}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle: fkCol ? `source-${fkCol.id}` : undefined,
            targetHandle: pkCol ? `target-${pkCol.id}` : undefined,
            type: "relationship",
            data: { label: labelMap[suggestion.type], type: suggestion.type },
            markerEnd: { type: MarkerType.ArrowClosed },
          });
          appliedSuggestions.push(
            `**${suggestion.source}** → **${suggestion.target}** (${suggestion.type}): ${suggestion.reason}`,
          );
        }
      });

      useERDStore.setState({ edges: newEdges });

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          appliedSuggestions.length > 0
            ? `✨ Ditemukan dan diterapkan **${appliedSuggestions.length}** relasi baru:\n\n${appliedSuggestions.map((s) => `• ${s}`).join("\n")}`
            : "✅ Semua relasi sudah ada. Tidak ada yang perlu ditambahkan.",
        timestamp: Date.now(),
      });
    } catch (err) {
      const messages = useERDStore.getState().messages;
      useERDStore
        .getState()
        .setMessages(messages.filter((m) => m.id !== processingId));
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        content: `Error: ${err instanceof Error ? err.message : "Failed to suggest relations"}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return {
    generate,
    suggestRelations,
    error,
    isGenerating,
    isSuggesting,
    setError,
  };
}
