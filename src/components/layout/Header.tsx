import { FileJson, Save, Settings, Database } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-sidebar flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-semibold text-lg text-text-primary">
          AI-Visual Database Architect
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors">
          <FileJson className="w-4 h-4" />
          Export SQL
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors">
          <Save className="w-4 h-4" />
          Save Project
        </button>
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
