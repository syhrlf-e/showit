import { type Node, type Edge } from "@xyflow/react";
import { type TableData } from "../types/erd";

export function generateSQL(nodes: Node<TableData>[], edges: Edge[]): string {
  let sql = "";

  nodes.forEach((node) => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, "_");
    sql += `CREATE TABLE ${tableName} (\n`;

    const primaryKeys: string[] = [];

    const hasPrimaryKey = node.data.columns.some((c) => c.isPrimaryKey);

    node.data.columns.forEach((col, index) => {
      const colName = col.name;

      let colType = col.type.toUpperCase();
      if (colType === "UUID") {
        colType = "CHAR(36)";
      } else if (colType === "JSONB") {
        colType = "JSON";
      } else if (colType === "INTEGER") {
        colType = "INT";
      } else if (colType === "BOOLEAN") {
        colType = "TINYINT(1)";
      }

      const nullable = col.isNullable ? "NULL" : "NOT NULL";

      let fullType = colType;
      if (col.length && !colType.includes("(")) {
        fullType = `${colType}(${col.length})`;
      }

      let line = `  ${colName} ${fullType} ${nullable}`;

      if (index < node.data.columns.length - 1 || hasPrimaryKey) {
        line += ",";
      }

      sql += line + "\n";

      if (col.isPrimaryKey) {
        primaryKeys.push(colName);
      }
    });

    if (primaryKeys.length > 0) {
      sql += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
    }

    sql += `);\n\n`;
  });

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

      sql += `-- Relationship: ${sourceTable} -> ${targetTable} (${edge.data?.type || "1:N"})\n`;
      sql += `-- ALTER TABLE ${targetTable} ADD CONSTRAINT fk_${sourceTable} FOREIGN KEY (source_id) REFERENCES ${sourceTable}(id);\n\n`;
    }
  });

  return sql;
}
