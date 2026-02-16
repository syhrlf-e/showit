"use client";

import {
  FileJson,
  Database,
  Download,
  Image,
  LogIn,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toPng } from "html-to-image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);
  const { data: session } = useSession();

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
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);

  const handleCodeMode = () => {
    setSqlMode("code");
    setSidebarOpen(false);
  };

  const handleVisualMode = () => {
    setSqlMode("visual");
    setSidebarOpen(true);
  };

  return (
    <header className="h-14 border-b border-border bg-sidebar flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-bold text-lg text-text-primary tracking-tight hidden md:block">
          VIDA
        </h1>
      </div>

      <div className="flex items-center bg-background/50 rounded-lg p-1 border border-border mx-4">
        <button
          onClick={handleVisualMode}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${sqlMode === "visual" ? "bg-primary text-white shadow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Visual
        </button>
        <button
          onClick={handleCodeMode}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${sqlMode === "code" ? "bg-primary text-white shadow" : "text-text-secondary hover:text-text-primary"}`}
        >
          Editor
        </button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors outline-none">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3 text-text-secondary" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[150px] bg-card border border-border rounded-md shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 mr-4">
              <DropdownMenu.Item
                onSelect={handleExportSQL}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer hover:bg-primary/20 focus:bg-primary/20 text-text-primary"
              >
                <FileJson className="w-4 h-4 text-text-secondary" />
                Export SQL
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={handleExportImage}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer hover:bg-primary/20 focus:bg-primary/20 text-text-primary"
              >
                <Image className="w-4 h-4 text-text-secondary" />
                Export Image
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {session ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-colors outline-none border border-transparent hover:border-border">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <ChevronDown className="w-3 h-3 text-text-secondary mr-1" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-50 min-w-[150px] bg-card border border-border rounded-md shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 mr-4">
                <div className="px-2 py-1.5 text-xs text-text-secondary border-b border-border/50 mb-1">
                  {session.user?.email}
                </div>
                <DropdownMenu.Item
                  onSelect={() => signOut()}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-md text-sm font-medium transition-colors shadow-lg shadow-primary/20"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
