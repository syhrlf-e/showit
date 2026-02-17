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
  const pendingSQL = useERDStore((state) => state.pendingSQL);
  const setPendingSQL = useERDStore((state) => state.setPendingSQL);
  const importSQL = useERDStore((state) => state.importSQL);

  const generatedSQL = useMemo(() => generateSQL(nodes, edges), [nodes, edges]);
  const [localCode, setLocalCode] = useState<string | null>(null);

  // If pendingSQL exists, show it. Otherwise show local or generated.
  const displayCode = pendingSQL ?? localCode ?? generatedSQL;

  // Auto-sync effect with debounce (Only if NOT reviewing pending SQL)
  useEffect(() => {
    if (localCode === null || pendingSQL !== null) return;

    const timer = setTimeout(() => {
      syncSQL(localCode);
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [localCode, syncSQL, pendingSQL]);

  const handleAccept = () => {
    if (pendingSQL) {
      importSQL(pendingSQL);
      setPendingSQL(null);
      setLocalCode(null); // Reset local overrides
    }
  };

  const handleReject = () => {
    setPendingSQL(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#282c34] relative w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar border-b border-border shrink-0">
        <span className="text-sm font-semibold text-text-primary">
          {pendingSQL ? "Review AI Suggestions" : "SQL Editor"}
        </span>
        <div className="flex items-center gap-2">
          {pendingSQL ? (
            <span className="text-xs text-yellow-400 font-medium animate-pulse">
              Reviewing...
            </span>
          ) : (
            <span className="text-xs text-text-secondary italic">
              {localCode !== null ? "Syncing..." : "Synced"}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto relative">
        <CodeMirror
          value={displayCode}
          height="100%"
          theme={theme === "dark" ? "dark" : "light"}
          extensions={[sql()]}
          onChange={(value) => {
            if (!pendingSQL) setLocalCode(value);
          }}
          className="text-base h-full"
          readOnly={!!pendingSQL} // Read-only during review
        />

        {/* Review Actions Overlay */}
        {pendingSQL && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 shadow-2xl p-2 rounded-xl bg-card border border-border/50 backdrop-blur-md z-50">
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-500/20"
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
