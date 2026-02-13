"use client";

import { InputSection } from "../sidebar/InputSection";
import { HistoryPanel } from "../sidebar/HistoryPanel";
import { SuggestionsPanel } from "../sidebar/SuggestionsPanel";

export function Sidebar() {
  return (
    <aside className="w-full h-full bg-sidebar border-r border-border flex flex-col overflow-hidden">
      <InputSection />
      <div className="flex-1 overflow-y-auto">
        <HistoryPanel />
      </div>
      <SuggestionsPanel />
    </aside>
  );
}
