"use client";

import { useMemo } from "react";
import { useERDStore } from "@/store/erdStore";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  affectedTables?: string[];
}

// Types that are compatible for FK → PK matching
const COMPATIBLE_TYPES: Record<string, string[]> = {
  int: ["int", "integer", "bigint", "smallint", "tinyint"],
  bigint: ["bigint", "int", "integer"],
  varchar: ["varchar", "char", "text"],
  char: ["char", "varchar"],
  text: ["text", "varchar", "char"],
  uuid: ["uuid", "char", "varchar"],
};

function typesCompatible(fkType: string, pkType: string): boolean {
  const fk = fkType
    .toLowerCase()
    .replace(/\(.*\)/, "")
    .trim();
  const pk = pkType
    .toLowerCase()
    .replace(/\(.*\)/, "")
    .trim();
  if (fk === pk) return true;
  return COMPATIBLE_TYPES[fk]?.includes(pk) ?? false;
}

export function useERDValidation() {
  const nodes = useERDStore((state) => state.nodes);
  const edges = useERDStore((state) => state.edges);

  const issues = useMemo<ValidationIssue[]>(() => {
    const result: ValidationIssue[] = [];

    if (nodes.length === 0) return result;

    // Build lookup maps
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const nodeByLabel = new Map(nodes.map((n) => [n.data.label, n]));

    // ─── 1. Orphan Tables ─────────────────────────────────────────────────
    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const orphans = nodes.filter(
      (n) => !connectedNodeIds.has(n.id) && nodes.length > 1,
    );
    if (orphans.length > 0) {
      result.push({
        id: "orphan-tables",
        severity: "warning",
        title: `${orphans.length} Tabel Tidak Terhubung`,
        description:
          "Tabel ini tidak memiliki relasi dengan tabel lain. Pertimbangkan untuk menambah relasi.",
        affectedTables: orphans.map((n) => n.data.label),
      });
    }

    // ─── 2. Tables Without Primary Key ────────────────────────────────────
    const noPK = nodes.filter(
      (n) => !n.data.columns.some((c) => c.isPrimaryKey),
    );
    noPK.forEach((n) => {
      result.push({
        id: `no-pk-${n.id}`,
        severity: "error",
        title: `Tidak Ada Primary Key`,
        description: `Tabel "${n.data.label}" tidak memiliki kolom PRIMARY KEY.`,
        affectedTables: [n.data.label],
      });
    });

    // ─── 3. FK Type Mismatch ───────────────────────────────────────────────
    edges.forEach((edge) => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      if (!sourceNode || !targetNode) return;

      // Find PK of target
      const targetPK = targetNode.data.columns.find((c) => c.isPrimaryKey);
      if (!targetPK) return;

      // Find FK column in source (column that references target)
      const targetLabel = targetNode.data.label.toLowerCase();
      const fkCol = sourceNode.data.columns.find(
        (c) =>
          c.isForeignKey ||
          c.name.toLowerCase().includes(targetLabel) ||
          c.name.toLowerCase() === `${targetLabel}_id` ||
          c.name.toLowerCase() === `id_${targetLabel}`,
      );

      if (fkCol && !typesCompatible(fkCol.type, targetPK.type)) {
        result.push({
          id: `type-mismatch-${edge.id}`,
          severity: "error",
          title: "Tipe Data FK Tidak Cocok",
          description: `Kolom "${fkCol.name}" (${fkCol.type}) di "${sourceNode.data.label}" tidak kompatibel dengan PK "${targetPK.name}" (${targetPK.type}) di "${targetNode.data.label}".`,
          affectedTables: [sourceNode.data.label, targetNode.data.label],
        });
      }
    });

    // ─── 4. Duplicate Edges ────────────────────────────────────────────────
    const edgePairs = new Set<string>();
    edges.forEach((edge) => {
      const key = [edge.source, edge.target].sort().join("--");
      if (edgePairs.has(key)) {
        const sourceNode = nodeById.get(edge.source);
        const targetNode = nodeById.get(edge.target);
        result.push({
          id: `duplicate-edge-${edge.id}`,
          severity: "warning",
          title: "Relasi Duplikat",
          description: `Ada lebih dari satu relasi antara "${sourceNode?.data.label}" dan "${targetNode?.data.label}".`,
          affectedTables: [
            sourceNode?.data.label ?? "",
            targetNode?.data.label ?? "",
          ],
        });
      }
      edgePairs.add(key);
    });

    // ─── 5. Circular Dependency Detection ─────────────────────────────────
    // Build adjacency list
    const adj = new Map<string, string[]>();
    nodes.forEach((n) => adj.set(n.id, []));
    edges.forEach((e) => {
      adj.get(e.source)?.push(e.target);
    });

    // DFS cycle detection
    const visited = new Set<string>();
    const inStack = new Set<string>();
    let cycleFound = false;
    const cycleTables: string[] = [];

    function dfs(nodeId: string, path: string[]): boolean {
      if (inStack.has(nodeId)) {
        // Found a cycle - extract cycle tables
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart);
        cycle.forEach((id) => {
          const label = nodeById.get(id)?.data.label;
          if (label && !cycleTables.includes(label)) {
            cycleTables.push(label);
          }
        });
        return true;
      }
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      inStack.add(nodeId);

      for (const neighbor of adj.get(nodeId) ?? []) {
        if (dfs(neighbor, [...path, nodeId])) {
          cycleFound = true;
        }
      }

      inStack.delete(nodeId);
      return false;
    }

    nodes.forEach((n) => {
      if (!visited.has(n.id)) {
        dfs(n.id, []);
      }
    });

    if (cycleFound && cycleTables.length > 0) {
      result.push({
        id: "circular-dependency",
        severity: "warning",
        title: "Circular Dependency Terdeteksi",
        description:
          "Ada relasi melingkar antar tabel. Ini bisa menyebabkan masalah saat insert data.",
        affectedTables: cycleTables,
      });
    }

    // ─── 6. Empty Tables ───────────────────────────────────────────────────
    const emptyTables = nodes.filter((n) => n.data.columns.length === 0);
    emptyTables.forEach((n) => {
      result.push({
        id: `empty-table-${n.id}`,
        severity: "warning",
        title: "Tabel Kosong",
        description: `Tabel "${n.data.label}" tidak memiliki kolom.`,
        affectedTables: [n.data.label],
      });
    });

    // ─── 7. All good info ─────────────────────────────────────────────────
    if (result.length === 0 && nodes.length > 0) {
      result.push({
        id: "all-good",
        severity: "info",
        title: "Schema Valid",
        description: "Tidak ada masalah yang ditemukan pada schema ini.",
      });
    }

    return result;
  }, [nodes, edges]);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return { issues, errorCount, warningCount };
}
