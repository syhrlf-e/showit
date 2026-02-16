import {
  FileJson,
  Database,
  Download,
  Image,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useERDStore } from "@/store/erdStore";
import { generateSQL } from "@/utils/sqlGenerator";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toPng } from "html-to-image";

export function Header() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);

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
    const viewport = document.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement;
    if (viewport) {
      try {
        await toPng(viewport, {
          backgroundColor: "#0a0a0a", // dark background
          width: viewport.scrollWidth,
          height: viewport.scrollHeight,
          style: {
            width: "100%",
            height: "100%",
            transform: "translate(0, 0)", // Reset transform for full capture? might need adjustments for fitView
          },
        });

        // Actually react-flow has a specific way to export.
        // Simple approach: grab the .react-flow element
        // Better approach: use getNodesBounds and fitView equivalent logic or just grab the container
        // Let's grab the container for now, simpler
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }

    // Alternative simpler approach for now targeting the main wrapper
    // We can refine this later if user complains about empty space or zoom
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

  return (
    <header className="h-16 border-b border-border bg-sidebar flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-semibold text-lg text-text-primary">
          AI-Visual Database Architect
        </h1>
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

        <button className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-md text-sm font-medium transition-colors shadow-lg shadow-primary/20">
          <LogIn className="w-4 h-4" />
          Login
        </button>
      </div>
    </header>
  );
}
