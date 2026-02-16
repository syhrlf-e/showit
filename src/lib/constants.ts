import { Edge, MarkerType, Node } from "@xyflow/react";
import { TableData } from "@/types/erd";

export const DEFAULT_NODES: Node<TableData>[] = [
  {
    id: "1",
    type: "table",
    position: { x: 100, y: 100 },
    data: {
      label: "Users",
      columns: [
        {
          id: "c1",
          name: "id",
          type: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "c2",
          name: "email",
          type: "varchar",
          length: "255",
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "c3",
          name: "created_at",
          type: "timestamp",
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: false,
        },
      ],
    },
  },
  {
    id: "2",
    type: "table",
    position: { x: 500, y: 100 },
    data: {
      label: "Posts",
      columns: [
        {
          id: "p1",
          name: "id",
          type: "int",
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "p2",
          name: "user_id",
          type: "int",
          isPrimaryKey: false,
          isForeignKey: true,
          isNullable: false,
        },
        {
          id: "p3",
          name: "title",
          type: "varchar",
          length: "255",
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "p4",
          name: "content",
          type: "text",
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: true,
        },
      ],
    },
  },
];

export const DEFAULT_EDGES: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "relationship",
    data: { label: "has many", type: "1:N" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];
