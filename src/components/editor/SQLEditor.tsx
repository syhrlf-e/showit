"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import { Play } from "lucide-react";

export function SQLEditor() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const theme = useERDStore((state) => state.theme);
  const importSQL = useERDStore((state) => state.importSQL);

  const generatedSQL = useMemo(() => generateSQL(nodes, edges), [nodes, edges]);
  const [localCode, setLocalCode] = useState<string | null>(null);

  const displayCode = localCode ?? generatedSQL;

  const handleApply = () => {
    importSQL(displayCode);
    setLocalCode(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#282c34] border-l border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar border-b border-border">
        <span className="text-sm font-semibold text-text-primary">
          SQL Editor
        </span>
        <button
          onClick={handleApply}
          className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
        >
          <Play className="w-3 h-3" />
          Apply Changes
        </button>
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
