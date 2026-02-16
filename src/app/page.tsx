"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SplitView } from "@/components/layout/SplitView";

export default function Home() {
  return (
    <MainLayout sidebar={<Sidebar />}>
      <SplitView />
    </MainLayout>
  );
}
