import { Parser } from "node-sql-parser";
import { Node, Edge } from "@xyflow/react";
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
  constraint_type: "primary key";
  definition: {
    column: string;
  }[];
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

  try {
    const ast = parser.astify(sql);
    const statements = Array.isArray(ast) ? ast : [ast];

    statements.forEach((stmt: unknown, index: number) => {
      const createStmt = stmt as SQLCreateTableStatement;

      if (createStmt.type === "create" && createStmt.keyword === "table") {
        const tableName = createStmt.table[0].table;
        const columns: Column[] = [];
        const nodeId = crypto.randomUUID();

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

        createStmt.create_definitions?.forEach((def) => {
          if (def.resource === "column") {
            const colDef = def as SQLColumnDefinition;
            const colName = colDef.column.column;
            const dataType = colDef.definition.dataType;
            const length = colDef.definition.length;

            const isPrimaryKey =
              tablePrimaryKeys.includes(colName) ||
              colDef.primary_key === "primary key";

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
    return { nodes: [], edges: [] };
  }

  return { nodes, edges };
};
