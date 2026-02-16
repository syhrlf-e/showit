"use client";

import { type ReactNode, useState, useEffect } from "react";
import { Header } from "./Header";
import { useERDStore } from "@/store/erdStore";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const sidebarOpen = useERDStore((state) => state.sidebarOpen);
  const setSidebarOpen = useERDStore((state) => state.setSidebarOpen);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = () => {
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Container */}
        {sidebarOpen ? (
          <div
            className="h-full flex-shrink-0 relative group border-r border-border"
            style={{ width: sidebarWidth }}
          >
            {/* Minimize Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 z-20 p-1 rounded-md bg-card/80 border border-border text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Minimize Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            {sidebar}

            {/* Resizer Handle */}
            <div
              onMouseDown={startResizing}
              className="absolute right-[-2px] top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-primary/50 transition-colors"
            />
          </div>
        ) : (
          <div className="h-full flex-shrink-0 border-r border-border flex flex-col items-center py-2 w-10 bg-sidebar">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 h-full relative">{children}</main>
      </div>
    </div>
  );
}
