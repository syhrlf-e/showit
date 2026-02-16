"use client";

import { useState } from "react";
import { Sparkles, FileCode, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import { LoadingDots } from "../ui/LoadingDots";

import { useERDStore } from "@/store/erdStore";

export function InputSection() {
  const [mode, setMode] = useState<"natural" | "sql">("natural");
  const [input, setInput] = useState("");
  const isGenerating = useERDStore((state) => state.isGenerating);
  const setIsGenerating = useERDStore((state) => state.setIsGenerating);
  const addToHistory = useERDStore((state) => state.addToHistory);
  const addNode = useERDStore((state) => state.addNode);

  const handleGenerate = () => {
    if (!input.trim()) return;

    setIsGenerating(true);

    // Simulate API delay
    setTimeout(() => {
      const prompt = input.toLowerCase();

      if (prompt.includes("blog")) {
        // Add Blog Schema
        addNode({
          id: crypto.randomUUID(),
          type: "table",
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: "Posts",
            columns: [
              {
                id: crypto.randomUUID(),
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "title",
                type: "varchar",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "content",
                type: "text",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: true,
              },
            ],
          },
        });
        addNode({
          id: crypto.randomUUID(),
          type: "table",
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: "Comments",
            columns: [
              {
                id: crypto.randomUUID(),
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "post_id",
                type: "uuid",
                isPrimaryKey: false,
                isForeignKey: true,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "body",
                type: "text",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
            ],
          },
        });
      } else if (prompt.includes("ecommerce") || prompt.includes("shop")) {
        // Add E-commerce Schema
        addNode({
          id: crypto.randomUUID(),
          type: "table",
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: "Products",
            columns: [
              {
                id: crypto.randomUUID(),
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "name",
                type: "varchar",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "price",
                type: "decimal",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
            ],
          },
        });
        addNode({
          id: crypto.randomUUID(),
          type: "table",
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: "Orders",
            columns: [
              {
                id: crypto.randomUUID(),
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "user_id",
                type: "uuid",
                isPrimaryKey: false,
                isForeignKey: true,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "total",
                type: "decimal",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: false,
              },
            ],
          },
        });
      } else {
        // Generic Fallback
        addNode({
          id: crypto.randomUUID(),
          type: "table",
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: "AI_Generated_Table",
            columns: [
              {
                id: crypto.randomUUID(),
                name: "id",
                type: "uuid",
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
              },
              {
                id: crypto.randomUUID(),
                name: "name",
                type: "varchar",
                isPrimaryKey: false,
                isForeignKey: false,
                isNullable: true,
              },
            ],
          },
        });
      }

      addToHistory({
        id: crypto.randomUUID(),
        prompt: input,
        timestamp: Date.now(),
      });
      setIsGenerating(false);
      setInput("");
    }, 1500);
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
