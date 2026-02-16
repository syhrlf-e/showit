"use client";

import { Check, RefreshCw, Wand2 } from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { useState } from "react";
import { generateSQL } from "@/utils/sqlGenerator"; // We'll use this to get current schema

export function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; description: string; action: () => void }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const importSQL = useERDStore((state) => state.importSQL);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const currentSchema = generateSQL(nodes, edges);
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Analyze this database schema and provide 3 optimization suggestions or missing tables. Return the response as a valid JSON array of objects with 'title', 'description', and 'sql_action' keys. The 'sql_action' should be the SQL command to implement the suggestion. Output ONLY the JSON array.",
          currentSchema,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Simple parsing of the AI response which might be wrapped in JSON markdown
      let content = data.sql || "";
      // Clean up markdown if present
      content = content
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();

      let parsedSuggestions = [];
      try {
        parsedSuggestions = JSON.parse(content);
      } catch (e) {
        // Fallback if AI didn't return valid JSON (common with smaller models, but Llama 70B is usually good)
        // For now, let's just mock if parsing fails or show a generic message
        console.error("Failed to parse AI suggestions", e);
      }

      if (Array.isArray(parsedSuggestions)) {
        setSuggestions(
          parsedSuggestions.map(
            (s: {
              title: string;
              description: string;
              sql_action: string;
            }) => ({
              id: crypto.randomUUID(),
              title: s.title,
              description: s.description,
              action: () => importSQL(s.sql_action),
            }),
          ),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 border-t border-border bg-card/20">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">
          AI Suggestions
        </h2>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 rounded-md text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          title="Analyze Schema"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {suggestions.length === 0 && !loading && (
          <div className="text-center text-text-secondary text-xs italic py-4">
            Click the wand to analyze your schema for improvements.
          </div>
        )}

        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </div>
            <button
              onClick={suggestion.action}
              className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
            >
              <Check className="w-3 h-3" />
              Apply Fix
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
