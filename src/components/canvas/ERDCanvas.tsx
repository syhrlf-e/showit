"use client";

import {
  ReactFlow,
  Background,
  Controls,
  type NodeTypes,
  type EdgeTypes,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./TableNode";
import { RelationshipEdge } from "./RelationshipEdge";
import { CanvasToolbar } from "./CanvasToolbar";

const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

const initialNodes = [
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
          type: "uuid",
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "c2",
          name: "email",
          type: "varchar(255)",
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
          type: "uuid",
          isPrimaryKey: true,
          isForeignKey: false,
          isNullable: false,
        },
        {
          id: "p2",
          name: "user_id",
          type: "uuid",
          isPrimaryKey: false,
          isForeignKey: true,
          isNullable: false,
        },
        {
          id: "p3",
          name: "title",
          type: "varchar(255)",
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

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "relationship",
    data: { label: "has many", type: "1:N" },
  },
];

export function ERDCanvas() {
  return (
    <div className="w-full h-full bg-background relative">
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
        className="bg-background"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background gap={16} size={1} color="#2a2a2a" />
        <Controls className="bg-card border-border text-text-primary fill-text-primary !bg-card" />
        <MiniMap
          className="!bg-card !border-border"
          maskColor="#0a0a0a"
          nodeColor="#3b82f6"
        />
        <CanvasToolbar />
      </ReactFlow>
    </div>
  );
}
