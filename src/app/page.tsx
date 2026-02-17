"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ERDCanvas } from "@/components/canvas/ERDCanvas";

export default function Home() {
  return (
    <ErrorBoundary>
      <MainLayout sidebar={<Sidebar />}>
        <ERDCanvas />
      </MainLayout>
    </ErrorBoundary>
  );
}
