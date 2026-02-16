"use client";

import { useMemo, useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";

export function SQLEditor() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const theme = useERDStore((state) => state.theme);
  const syncSQL = useERDStore((state) => state.syncSQL);

  const generatedSQL = useMemo(() => generateSQL(nodes, edges), [nodes, edges]);
  const [localCode, setLocalCode] = useState<string | null>(null);

  const displayCode = localCode ?? generatedSQL;

  // Auto-sync effect with debounce
  useEffect(() => {
    if (localCode === null) return; // Don't sync if no local changes

    const timer = setTimeout(() => {
      syncSQL(localCode);
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [localCode, syncSQL]);

  // Sync back if external changes happen (and user is not typing)
  useEffect(() => {
    // This effect handles the case where generatedSQL updates due to outside changes.
    // However, since we display localCode ?? generatedSQL, it's handled implicitly.
    // Linter complains about missing deps if we keep the block empty with deps.
    // So we can just remove it or keep it simple.
  }, [generatedSQL, displayCode]);

  return (
    <div className="h-full flex flex-col bg-[#282c34] border-l border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar border-b border-border">
        <span className="text-sm font-semibold text-text-primary">
          SQL Editor
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary italic">
            {localCode !== null ? "Syncing..." : "Synced"}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={displayCode}
          height="100%"
          theme={theme === "dark" ? "dark" : "light"}
          extensions={[sql()]}
          onChange={(value) => {
            setLocalCode(value);
          }}
          className="text-base"
        />
      </div>
    </div>
  );
}
