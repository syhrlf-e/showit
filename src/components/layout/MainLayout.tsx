"use client";

import { type ReactNode } from "react";
import { Header } from "./Header";
import { useERDStore } from "@/store/erdStore";
import { PanelLeftOpen } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const sidebarOpen = useERDStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);

  return (
    <div className="h-screen w-screen flex bg-background text-text-primary overflow-hidden">
      {sidebarOpen ? (
        <div className="h-full flex-shrink-0 relative group border-r border-border">
          {sidebar}
        </div>
      ) : (
        <div className="h-full flex-shrink-0 border-r border-border flex flex-col items-center py-2 w-16 bg-sidebar hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors mt-2"
            title="Show Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 h-full relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
