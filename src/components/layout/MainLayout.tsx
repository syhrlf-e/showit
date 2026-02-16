"use client";

import { type ReactNode } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-primary overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="h-full flex-shrink-0 relative group border-r border-border">
          {sidebar}
        </div>
        <main className="flex-1 h-full relative overflow-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
