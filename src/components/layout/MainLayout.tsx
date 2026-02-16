"use client";

import { type ReactNode } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex bg-background text-text-primary overflow-hidden">
      {/* Sidebar - Full Height */}
      <div className="h-full flex-shrink-0 relative z-50">{sidebar}</div>

      {/* Main Content - Header + Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 h-full relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
