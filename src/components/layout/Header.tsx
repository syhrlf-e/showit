"use client";

import { FileJson, Download, Image, ChevronDown } from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toPng } from "html-to-image";

export function Header() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  // Removed unused sessions/currentChatId
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
      {/* Left Section: Branding or Title */}
      <div className="flex items-center gap-2 w-[200px] pl-4">
        {/* Restored VIDA text as requested previously, but wait, the view in 964 showed "Playground/Untitled Project" 
            BUT in Step 806 I added "VIDA". 
            The file content in 964 seems to have LOST the "VIDA" text I added in Step 806?
            This is because I was editing the Header file in parallel or the view in 964 was from a state that had reverted?
            
            Let's check Step 806:
            +      <div className="flex items-center gap-2 w-[200px] pl-4">
            +        <h1 className="font-bold text-lg text-text-primary tracking-tight">
            +          VIDA
            +        </h1>
            +      </div>

            The view in 964 (lines 60-70) shows:
            60:       <div className="flex items-center gap-3 w-[200px]">
            61:         <div className="flex flex-col">
            ... sessions ...

            The user asked "nama VIDA nya berada di header".
            I supposedly executed that.
            If 964 shows sessions, it means my previous edit might have been overwritten or I'm looking at a different version?
            Or maybe I edited it, but then a subsequent edit (or git checkout?) changed it back?
            
            Wait, I should prioritize the USER REQUEST: "nama VIDA nya berada di header".
            So I will restore the VIDA text and remove the session info if that's what was replaced.
            Or maybe the user wants BOTH?
            "icon posisinya sudah benar, nah nama VIDA nya berada di header"
            
            I will put VIDA there.
        */}
        <h1 className="font-bold text-lg text-text-primary tracking-tight">
          ShowIt
        </h1>
      </div>

      {/* Center: View Toggle */}
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

      {/* Right: Export & Actions */}
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
