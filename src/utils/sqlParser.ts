import { Parser } from "node-sql-parser";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { TableData, Column } from "../types/erd";

const parser = new Parser();

interface SQLColumnDefinition {
  column: {
    column: string;
  };
  definition: {
    dataType: string;
    length?: number;
  };
  resource: "column";
  primary_key?: "primary key";
}

interface SQLConstraintDefinition {
  constraint_type: "primary key" | "foreign key";
  definition: {
    column: string;
  }[];
  reference?: {
    table: { table: string }[];
    definition: { column: string }[];
  };
  resource: "constraint";
}

type CreateDefinition = SQLColumnDefinition | SQLConstraintDefinition;

interface SQLCreateTableStatement {
  type: "create";
  keyword: "table";
  table: { table: string }[];
  create_definitions?: CreateDefinition[];
}

export const parseSQLToERD = (sql: string) => {
  const nodes: Node<TableData>[] = [];
  const edges: Edge[] = [];

  if (!sql.trim()) return { nodes, edges };

  // Map tableName → nodeId for edge generation
  const tableIdMap: Record<string, string> = {};

  try {
    const ast = parser.astify(sql);
    const statements = Array.isArray(ast) ? ast : [ast];

    // First pass: create all nodes
    statements.forEach((stmt: unknown, index: number) => {
      const createStmt = stmt as SQLCreateTableStatement;

      if (createStmt.type === "create" && createStmt.keyword === "table") {
        const tableName = createStmt.table[0].table;
        const columns: Column[] = [];
        const nodeId = crypto.randomUUID();

        tableIdMap[tableName] = nodeId;

        const tablePrimaryKeys: string[] = [];

        createStmt.create_definitions?.forEach((def) => {
          if (
            "constraint_type" in def &&
            def.constraint_type === "primary key"
          ) {
            def.definition.forEach((col) => {
              tablePrimaryKeys.push(col.column);
            });
          }
        });

        // Detect FK columns by naming convention (e.g. id_pelanggan → pelanggan table)
        const fkColumns: string[] = [];
        createStmt.create_definitions?.forEach((def) => {
          if (
            "constraint_type" in def &&
            def.constraint_type === "foreign key" &&
            def.reference
          ) {
            def.definition.forEach((col) => fkColumns.push(col.column));
          }
        });

        createStmt.create_definitions?.forEach((def) => {
          if (def.resource === "column") {
            const colDef = def as SQLColumnDefinition;
            const colName = colDef.column.column;
            const dataType = colDef.definition.dataType;
            const length = colDef.definition.length;

            const isPrimaryKey =
              tablePrimaryKeys.includes(colName) ||
              colDef.primary_key === "primary key";

            const isForeignKey = fkColumns.includes(colName);

            columns.push({
              id: crypto.randomUUID(),
              name: colName,
              type: dataType.toLowerCase(),
              length: length ? String(length) : undefined,
              isPrimaryKey: isPrimaryKey,
              isForeignKey: isForeignKey,
              isNullable: true,
            });
          }
        });

        nodes.push({
          id: nodeId,
          type: "table",
          position: { x: 100 + index * 300, y: 100 },
          data: {
            label: tableName,
            columns,
          },
        });
      }
    });

    // Second pass: create edges from FK constraints
    statements.forEach((stmt: unknown) => {
      const createStmt = stmt as SQLCreateTableStatement;

      if (createStmt.type === "create" && createStmt.keyword === "table") {
        const sourceTableName = createStmt.table[0].table;
        const sourceId = tableIdMap[sourceTableName];
        const sourceNode = nodes.find((n) => n.data.label === sourceTableName);

        createStmt.create_definitions?.forEach((def) => {
          if (
            "constraint_type" in def &&
            def.constraint_type === "foreign key" &&
            def.reference
          ) {
            const targetTableName = def.reference.table[0].table;
            const targetId = tableIdMap[targetTableName];
            const targetNode = nodes.find(
              (n) => n.data.label === targetTableName,
            );

            if (sourceId && targetId && sourceNode) {
              // Try to get FK column name from AST definition
              const fkColNameFromAST = (
                def as { definition?: { column: string }[] }
              ).definition?.[0]?.column;

              // Find FK column in source node - try AST name first, then name matching
              const t = targetTableName.toLowerCase();
              const tSingular = t.endsWith("s") ? t.slice(0, -1) : t;

              const fkCol = sourceNode.data.columns.find((c) => {
                const cn = c.name.toLowerCase();
                // Try exact match from AST first
                if (fkColNameFromAST && cn === fkColNameFromAST.toLowerCase())
                  return true;
                // Fallback: name convention matching
                return (
                  cn === `${t}_id` ||
                  cn === `${tSingular}_id` ||
                  cn === `id_${t}` ||
                  cn === `id_${tSingular}`
                );
              });

              // Mark column as FK
              if (fkCol) fkCol.isForeignKey = true;

              // Find PK column in target
              const pkCol = targetNode?.data.columns.find(
                (c) => c.isPrimaryKey,
              );

              edges.push({
                id: `e-${sourceId}-${targetId}-${crypto.randomUUID()}`,
                source: sourceId,
                target: targetId,
                sourceHandle: fkCol ? `source-${fkCol.id}` : undefined,
                targetHandle: pkCol ? `target-${pkCol.id}` : undefined,
                type: "relationship",
                data: { label: "has many", type: "1:N" },
                markerEnd: { type: MarkerType.ArrowClosed },
              });
            }
          }
        });
      }
    });

    // Third pass: fallback heuristic — detect FK by column naming convention
    // e.g. column "user_id" in table "orders" → edge to table "users"
    const edgeSet = new Set(edges.map((e) => `${e.source}--${e.target}`));
    const tableNames = Object.keys(tableIdMap);

    nodes.forEach((sourceNode) => {
      sourceNode.data.columns.forEach((col) => {
        const colLower = col.name.toLowerCase();

        // Match patterns: X_id, id_X, Xid
        for (const targetTable of tableNames) {
          if (targetTable === sourceNode.data.label) continue;

          const t = targetTable.toLowerCase();
          // Remove trailing 's' for singular matching (users → user)
          const tSingular = t.endsWith("s") ? t.slice(0, -1) : t;

          const isFK =
            colLower === `${t}_id` ||
            colLower === `id_${t}` ||
            colLower === `${tSingular}_id` ||
            colLower === `id_${tSingular}` ||
            colLower === `${t}id` ||
            colLower === `${tSingular}id`;

          if (isFK) {
            const sourceId = tableIdMap[sourceNode.data.label];
            const targetId = tableIdMap[targetTable];
            const pairKey = `${sourceId}--${targetId}`;
            const reversePairKey = `${targetId}--${sourceId}`;

            // Only add if edge doesn't already exist
            if (!edgeSet.has(pairKey) && !edgeSet.has(reversePairKey)) {
              edgeSet.add(pairKey);

              // Find PK column in target node
              const targetNode = nodes.find(
                (n) => n.data.label === targetTable,
              );
              const pkCol = targetNode?.data.columns.find(
                (c) => c.isPrimaryKey,
              );

              edges.push({
                id: `e-heuristic-${sourceId}-${targetId}-${crypto.randomUUID()}`,
                source: sourceId,
                target: targetId,
                sourceHandle: `source-${col.id}`,
                targetHandle: pkCol ? `target-${pkCol.id}` : undefined,
                type: "relationship",
                data: { label: "has many", type: "1:N" },
                markerEnd: { type: MarkerType.ArrowClosed },
              });
            }
          }
        }
      });
    });
  } catch (err) {
    console.error("SQL Parse Error", err);
    return { nodes: [], edges: [] };
  }

  return { nodes, edges };
};
