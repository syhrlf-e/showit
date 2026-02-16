"use client";

import { useERDStore } from "@/store/erdStore";
import { ERDCanvas } from "../canvas/ERDCanvas";
import { SQLEditor } from "../editor/SQLEditor";

export function SplitView() {
  const sqlMode = useERDStore((state) => state.sqlMode);

  if (sqlMode === "visual") {
    return <ERDCanvas />;
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 h-full border-r border-border">
        <ERDCanvas />
      </div>
      <div className="flex-1 h-full">
        <SQLEditor />
      </div>
    </div>
  );
}
