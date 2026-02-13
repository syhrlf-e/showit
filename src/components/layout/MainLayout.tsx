"use client";

import { type ReactNode, useState, useRef, useEffect } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizing = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Container */}
        <div
          className="h-full flex-shrink-0 relative group border-r border-border"
          style={{ width: sidebarWidth }}
        >
          {sidebar}

          {/* Resizer Handle */}
          <div
            onMouseDown={startResizing}
            className="absolute right-[-2px] top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-primary/50 transition-colors"
          />
        </div>

        {/* Main Content (Canvas) */}
        <main className="flex-1 h-full relative">{children}</main>
      </div>
    </div>
  );
}
