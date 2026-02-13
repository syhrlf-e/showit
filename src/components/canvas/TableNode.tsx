"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { KeyRound, MoreVertical } from "lucide-react";
import { type TableData } from "../../types/erd";
import { motion } from "framer-motion";

export const TableNode = memo(({ data }: NodeProps<Node<TableData>>) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card border border-border rounded-lg shadow-lg min-w-[240px] overflow-hidden hover:ring-2 hover:ring-primary/50 transition-shadow"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-sidebar border-b border-border flex items-center justify-between">
        <div className="font-semibold text-text-primary">{data.label}</div>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-2 flex flex-col gap-1">
        {data.columns.map((col) => (
          <div
            key={col.id}
            className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded group transition-colors"
          >
            <div className="flex items-center gap-2">
              {col.isPrimaryKey && (
                <KeyRound className="w-3 h-3 text-primary" />
              )}
              <span className="text-sm text-text-primary">{col.name}</span>
            </div>
            <span className="text-xs text-text-secondary font-mono group-hover:text-text-primary transition-colors">
              {col.type}
            </span>
          </div>
        ))}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all"
      />
    </motion.div>
  );
});
