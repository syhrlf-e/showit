"use client";

import {
  FileJson,
  Download,
  Image,
  ChevronDown,
  Database,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toPng } from "html-to-image";

export function Header() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const sidebarOpen = useERDStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);

  const handleExportSQL = () => {
    const sql = generateSQL(nodes, edges);
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.sql";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    const el = document.querySelector(".react-flow") as HTMLElement;
    if (el) {
      toPng(el, { backgroundColor: "#0a0a0a" }).then((dataUrl) => {
        const a = document.createElement("a");
        a.download = "erd-schema.png";
        a.href = dataUrl;
        a.click();
      });
    }
  };

  const setSqlMode = useERDStore((state) => state.setSqlMode);
  const sqlMode = useERDStore((state) => state.sqlMode);

  const handleCodeMode = () => {
    setSqlMode("code");
    setSidebarOpen(false);
  };

  const handleVisualMode = () => {
    setSqlMode("visual");
    setSidebarOpen(true);
  };

  return (
    <header className="h-14 border-b border-border bg-sidebar flex items-center justify-between px-4 relative flex-shrink-0 z-50">
      <div className="flex items-center gap-3 w-[200px]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-bold text-lg text-text-primary tracking-tight">
            VIDA
          </h1>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-background/50 rounded-lg p-1 border border-border">
        <button
          onClick={handleVisualMode}
          className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
            sqlMode === "visual"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          Visual
        </button>
        <button
          onClick={handleCodeMode}
          className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
            sqlMode === "code"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          Editor
        </button>
      </div>

      <div className="flex items-center gap-2 w-[200px] justify-end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors outline-none border border-transparent hover:border-border">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-text-secondary" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 mr-4">
              <DropdownMenu.Item
                onSelect={handleExportSQL}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <FileJson className="w-4 h-4 text-text-secondary group-hover:text-primary" />
                Export SQL
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={handleExportImage}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <Image className="w-4 h-4 text-text-secondary group-hover:text-primary" />
                Export Image
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
