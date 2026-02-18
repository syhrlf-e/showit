import { type Node, type Edge } from "@xyflow/react";
import { type TableData } from "../types/erd";

export type SchemaFormat = "mysql" | "postgresql" | "mongodb" | "json";

export function generateSchema(
  nodes: Node<TableData>[],
  edges: Edge[],
  format: SchemaFormat,
): string {
  switch (format) {
    case "mysql":
      return generateMySQL(nodes, edges);
    case "postgresql":
      return generatePostgreSQL(nodes, edges);
    case "mongodb":
      return generateMongoDB(nodes, edges);
    case "json":
      return JSON.stringify({ nodes, edges }, null, 2);
    default:
      return "";
  }
}

function generateMySQL(nodes: Node<TableData>[], edges: Edge[]): string {
  let sql = "";

  nodes.forEach((node) => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, "_");
    sql += `CREATE TABLE ${tableName} (\n`;

    const primaryKeys: string[] = [];
    const hasPrimaryKey = node.data.columns.some((c) => c.isPrimaryKey);

    node.data.columns.forEach((col, index) => {
      const colName = col.name;
      let colType = col.type.toUpperCase();

      if (colType === "UUID") colType = "CHAR(36)";
      else if (colType === "JSONB") colType = "JSON";
      else if (colType === "INTEGER") colType = "INT";
      else if (colType === "BOOLEAN") colType = "TINYINT(1)";

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

      if (col.isPrimaryKey) primaryKeys.push(colName);
    });

    if (primaryKeys.length > 0) {
      sql += `  PRIMARY KEY (${primaryKeys.join(", ")})\n`;
    }
    sql += `);\n\n`;
  });

  // Add Constraints
  edges.forEach((edge) => {
    // ... same constraint logic as before ...
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceTable = sourceNode.data.label
        .toLowerCase()
        .replace(/\s+/g, "_");
      const targetTable = targetNode.data.label
        .toLowerCase()
        .replace(/\s+/g, "_");

      const getColId = (h: string | null | undefined) =>
        h ? h.replace(/^(source-|target-)/, "") : null;
      const sourceColId = getColId(edge.sourceHandle);
      const targetColId = getColId(edge.targetHandle);

      let constraintSQL = "";
      // Note: In ERD, usually One-to-Many means Source has FK to Target or vice versa depending on arrow.
      // Here we assume standard ERD: Source (1) -> Target (N). Target has FK to Source.
      // Wait, existing logic: fk_${targetTable}_${sourceTable} FOREIGN KEY (${targetCol.name}) REFERENCES ${sourceTable}
      // This implies arrow points from Source (PK) to Target (FK)?
      // Let's stick to existing logic for consistency.

      if (sourceColId && targetColId) {
        const sourceCol = sourceNode.data.columns.find(
          (c) => c.id === sourceColId,
        );
        const targetCol = targetNode.data.columns.find(
          (c) => c.id === targetColId,
        );

        if (sourceCol && targetCol) {
          constraintSQL = `ALTER TABLE ${targetTable} ADD CONSTRAINT fk_${targetTable}_${sourceTable} FOREIGN KEY (${targetCol.name}) REFERENCES ${sourceTable}(${sourceCol.name});`;
        }
      }

      if (!constraintSQL) {
        constraintSQL = `-- Relationship: ${sourceTable} -> ${targetTable} (${edge.data?.type || "1:N"})`;
      }
      sql += `${constraintSQL}\n\n`;
    }
  });

  return sql;
}

function generatePostgreSQL(nodes: Node<TableData>[], edges: Edge[]): string {
  let sql = "";

  nodes.forEach((node) => {
    const tableName = node.data.label.toLowerCase().replace(/\s+/g, "_");
    sql += `CREATE TABLE "${tableName}" (\n`;

    const primaryKeys: string[] = [];
    const hasPrimaryKey = node.data.columns.some((c) => c.isPrimaryKey);

    node.data.columns.forEach((col, index) => {
      const colName = col.name;
      let colType = col.type.toUpperCase();

      // Postgres mappings
      if (colType === "INT") colType = "INTEGER";
      else if (colType === "DATETIME") colType = "TIMESTAMP";
      else if (colType === "BLOB") colType = "BYTEA";
      else if (colType === "JSON") colType = "JSONB";
      else if (colType === "TINYINT(1)") colType = "BOOLEAN";

      const nullable = col.isNullable ? "NULL" : "NOT NULL";
      let fullType = colType;
      if (
        col.length &&
        !colType.includes("(") &&
        !["TEXT", "JSONB", "BOOLEAN", "INTEGER", "TIMESTAMP"].includes(colType)
      ) {
        fullType = `${colType}(${col.length})`;
      }

      let line = `  "${colName}" ${fullType} ${nullable}`;
      if (index < node.data.columns.length - 1 || hasPrimaryKey) {
        line += ",";
      }
      sql += line + "\n";

      if (col.isPrimaryKey) primaryKeys.push(colName);
    });

    if (primaryKeys.length > 0) {
      sql += `  PRIMARY KEY ("${primaryKeys.join('", "')}")\n`;
    }
    sql += `);\n\n`;
  });

  // Constraints
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

      const getColId = (h: string | null | undefined) =>
        h ? h.replace(/^(source-|target-)/, "") : null;
      const sourceColId = getColId(edge.sourceHandle);
      const targetColId = getColId(edge.targetHandle);

      let constraintSQL = "";

      if (sourceColId && targetColId) {
        const sourceCol = sourceNode.data.columns.find(
          (c) => c.id === sourceColId,
        );
        const targetCol = targetNode.data.columns.find(
          (c) => c.id === targetColId,
        );

        if (sourceCol && targetCol) {
          constraintSQL = `ALTER TABLE "${targetTable}" ADD CONSTRAINT "fk_${targetTable}_${sourceTable}" FOREIGN KEY ("${targetCol.name}") REFERENCES "${sourceTable}"("${sourceCol.name}");`;
        }
      }

      if (!constraintSQL) {
        constraintSQL = `-- Relationship: ${sourceTable} -> ${targetTable} (${edge.data?.type || "1:N"})`;
      }
      sql += `${constraintSQL}\n\n`;
    }
  });

  return sql;
}

function generateMongoDB(nodes: Node<TableData>[], edges: Edge[]): string {
  let output =
    "const mongoose = require('mongoose');\nconst { Schema } = mongoose;\n\n";

  nodes.forEach((node) => {
    const tableName = node.data.label; // Keep original casing usually
    const schemaName = `${tableName}Schema`;

    output += `const ${schemaName} = new Schema({\n`;

    node.data.columns.forEach((col) => {
      const colName = col.name;
      let type = "String"; // Default

      const ct = col.type.toUpperCase();
      if (
        ["INT", "INTEGER", "BIGINT", "DECIMAL", "FLOAT"].some((t) =>
          ct.includes(t),
        )
      )
        type = "Number";
      if (ct.includes("BOOLEAN") || ct.includes("TINYINT")) type = "Boolean";
      if (ct.includes("DATE") || ct.includes("TIME")) type = "Date";
      if (ct.includes("JSON")) type = "Map"; // or Mixed

      // Reference detection?
      let ref = "";
      // Check if this column is a FK?
      // We can check if any edge targets this column

      output += `  ${colName}: { type: ${type} },\n`;
    });

    // Add references based on edges
    // If this node is the Target of an edge, it has a FK to source.
    // We should add/overwrite the field with ref.

    // Simplification for now: just basic schema.
    output += `});\n\nconst ${tableName} = mongoose.model('${tableName}', ${schemaName});\n\n`;
  });

  return output;
}
