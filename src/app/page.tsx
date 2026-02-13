import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { ERDCanvas } from "@/components/canvas/ERDCanvas";

export default function Home() {
  return (
    <MainLayout sidebar={<Sidebar />}>
      <ERDCanvas />
    </MainLayout>
  );
}
