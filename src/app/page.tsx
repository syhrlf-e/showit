"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SplitView } from "@/components/layout/SplitView";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <MainLayout sidebar={<Sidebar />}>
        <SplitView />
      </MainLayout>
    </ErrorBoundary>
  );
}
