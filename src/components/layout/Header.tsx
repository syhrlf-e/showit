"use client";

import {
  FileJson,
  Download,
  Image,
  ChevronDown,
  Upload,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { generateSchema } from "@/utils/schemaGenerator";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toPng } from "html-to-image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRef } from "react";
import { parseSQLToERD } from "@/utils/sqlParser";
import { toast } from "sonner";

export function Header() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const importSQL = useERDStore((state) => state.importSQL);
  const currentChatId = useERDStore((state) => state.currentChatId);
  const sessions = useERDStore((state) => state.sessions);

  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find((s) => s.id === currentChatId);
  const title = currentSession?.title || "Untitlted Conversation";

  const handleExportSchema = (
    format: "mysql" | "postgresql" | "mongodb" | "json",
  ) => {
    const content = generateSchema(nodes, edges, format);
    const extension =
      format === "json" ? "json" : format === "mongodb" ? "js" : "sql";
    const mimeType = format === "json" ? "application/json" : "text/plain";

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported to ${format.toUpperCase()}`);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // If JSON, load state directly?
        // Current implementation expects SQL for import.
        // For now, keep import as SQL only or try to detect.
        // If file extension is .json, maybe try to parse as state?
        if (file.name.endsWith(".json")) {
          try {
            const state = JSON.parse(content);
            if (state.nodes && state.edges) {
              useERDStore.setState({ nodes: state.nodes, edges: state.edges });
              toast.success("Imported JSON state");
            }
          } catch (e) {
            toast.error("Failed to parse JSON");
          }
        } else {
          importSQL(content);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-14 border-b border-border bg-sidebar flex items-center justify-between px-4 relative flex-shrink-0 z-50">
      {/* Left Section: Context Title */}
      <div className="flex items-center gap-2 pl-4">
        <h1 className="font-semibold text-sm text-text-primary tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {/* Import */}
        <input
          type="file"
          accept=".sql,.json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors outline-none border border-transparent hover:border-border"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export */}
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
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-text-secondary">
                Database Schema
              </DropdownMenu.Label>
              <DropdownMenu.Item
                onSelect={() => handleExportSchema("mysql")}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <div className="font-mono text-xs text-blue-400 w-5">MY</div>
                MySQL
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => handleExportSchema("postgresql")}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <div className="font-mono text-xs text-blue-300 w-5">PG</div>
                PostgreSQL
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => handleExportSchema("mongodb")}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <div className="font-mono text-xs text-green-400 w-5">DB</div>
                MongoDB
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-border my-1" />

              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-text-secondary">
                Other Formats
              </DropdownMenu.Label>
              <DropdownMenu.Item
                onSelect={() => handleExportSchema("json")}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-md outline-none cursor-pointer hover:bg-primary/10 text-text-primary group transition-colors"
              >
                <FileJson className="w-4 h-4 text-text-secondary group-hover:text-primary" />
                JSON State
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

        <div className="w-px h-4 bg-border mx-1" />

        {/* User Profile */}
        {session ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 pl-2 rounded-full hover:bg-white/5 transition-colors outline-none">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full border border-border/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 mr-4 mt-2"
                align="end"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs text-text-secondary truncate opacity-70">
                    {session.user?.email}
                  </p>
                </div>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item
                  onSelect={() => {
                    // Clear ERD storage on logout
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("erd-storage-mysql");
                      sessionStorage.removeItem("erd-storage-mysql");
                    }
                    signOut();
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg outline-none cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm shadow-primary/20"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
