import { Parser } from "node-sql-parser";
import { Node, Edge } from "@xyflow/react";
import { TableData, Column } from "../types/erd";

const parser = new Parser();

export const parseSQLToERD = (sql: string) => {
  const nodes: Node<TableData>[] = [];
  const edges: Edge[] = [];

  if (!sql.trim()) return { nodes, edges };

  try {
    const ast = parser.astify(sql); // Default is MySQL
    const statements = Array.isArray(ast) ? ast : [ast];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statements.forEach((stmt: any, index: number) => {
      if (stmt.type === "create" && stmt.keyword === "table") {
        const tableName = stmt.table[0].table;
        const columns: Column[] = [];
        const nodeId = crypto.randomUUID();

        // Track Primary Keys defined at table level
        const tablePrimaryKeys: string[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stmt.create_definitions?.forEach((def: any) => {
          if (def.constraint_type === "primary key") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            def.definition.forEach((col: any) => {
              tablePrimaryKeys.push(col.column);
            });
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stmt.create_definitions?.forEach((def: any) => {
          if (def.resource === "column") {
            // MySQL AST: def.column.column is DIRECTLY a string like "id" or "name"
            const colName = def.column.column;
            const dataType = def.definition.dataType;
            const length = def.definition.length;

            // Check if column is in table-level PK list OR has inline primary_key
            const isPrimaryKey =
              tablePrimaryKeys.includes(colName) ||
              def.primary_key === "primary key";

            columns.push({
              id: crypto.randomUUID(),
              name: colName,
              type: dataType.toLowerCase(),
              length: length ? String(length) : undefined,
              isPrimaryKey: isPrimaryKey,
              isForeignKey: false,
              isNullable: true,
            });
          }
        });

        nodes.push({
          id: nodeId,
          type: "table",
          position: { x: 100 + index * 260, y: 100 },
          data: {
            label: tableName,
            columns,
          },
        });
      }
    });
  } catch (err) {
    console.error("SQL Parse Error", err);
    throw err;
  }

  return { nodes, edges };
};
