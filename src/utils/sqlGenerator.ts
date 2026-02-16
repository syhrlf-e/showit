import { type Node, type Edge } from "@xyflow/react";
import { type TableData } from "../types/erd";

export function generateSQL(nodes: Node<TableData>[], edges: Edge[]): string {
  let sql = "";

  // 1. Create Tables
  nodes.forEach((node) => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, "_");
    sql += `CREATE TABLE ${tableName} (\n`;

    const primaryKeys: string[] = [];

    node.data.columns.forEach((col, index) => {
      const colName = col.name;
      const colType = col.type.toUpperCase();
      const nullable = col.isNullable ? "NULL" : "NOT NULL";

      let line = `  ${colName} ${colType} ${nullable}`;

      if (
        index < node.data.columns.length - 1 ||
        col.isPrimaryKey ||
        col.isForeignKey
      ) {
        line += ",";
      }

      sql += line + "\n";

      if (col.isPrimaryKey) {
        primaryKeys.push(colName);
      }
      if (col.isForeignKey) {
        // We need edges to find the target table
        // This is a simplified approach, ideally we should match column IDs with edge handles
        // For now, let's assume standard naming convention or skip explicit FK constraint generation in this iteration if too complex
        // But we can try to guess based on edges if possible.
        // Actually, let's just collect them for now.
      }
    });

    if (primaryKeys.length > 0) {
      sql += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
    }

    sql += `);\n\n`;
  });

  // 2. Add Foreign Keys (Alter Table)
  // We iterate over edges to find relationships
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceTable = sourceNode.data.label
        .toLowerCase()
        .replace(/\s+/g, "_");
      const targetTable = targetNode.data.label
        .toLowerCase()
        .replace(/\s+/g, "_");

      // Assuming the FK is on the "many" side (target) pointing to "one" side (source)
      // or we need to look at the edge type/data.
      // For simplicity in this mockup:
      // We will generate a generic comment or attempt a standard ALTER TABLE

      sql += `-- Relationship: ${sourceTable} -> ${targetTable} (${edge.data?.type || "1:N"})\n`;
      sql += `-- ALTER TABLE ${targetTable} ADD CONSTRAINT fk_${sourceTable} FOREIGN KEY (source_id) REFERENCES ${sourceTable}(id);\n\n`;
    }
  });

  return sql;
}
