"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { KeyRound, MoreVertical, Plus, Trash2, X } from "lucide-react";
import { type TableData, type Column } from "../../types/erd";
import { motion, AnimatePresence } from "framer-motion";
import { useERDStore } from "@/store/erdStore";
import { clsx } from "clsx";

export const TableNode = memo(
  ({ id, data, selected }: NodeProps<Node<TableData>>) => {
    const updateNode = useERDStore((state) => state.updateNode);
    const addColumn = useERDStore((state) => state.addColumn);
    const updateColumn = useERDStore((state) => state.updateColumn);
    const removeColumn = useERDStore((state) => state.removeColumn);
    const deleteNode = useERDStore((state) => state.deleteNode);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingColumn, setEditingColumn] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditingTitle && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, [isEditingTitle]);

    const handleTitleSubmit = () => {
      setIsEditingTitle(false);
      if (titleInputRef.current) {
        updateNode(id, { label: titleInputRef.current.value });
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={clsx(
          "bg-card border rounded-lg shadow-lg min-w-[240px] overflow-hidden transition-all",
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-sidebar border-b border-border flex items-center justify-between group">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              defaultValue={data.label}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="bg-background text-text-primary px-1 py-0.5 rounded border border-primary/50 text-sm font-semibold w-full outline-none"
            />
          ) : (
            <div
              className="font-semibold text-text-primary cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {data.label}
            </div>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => deleteNode(id)}
              className="text-text-secondary hover:text-red-500 transition-colors p-1 rounded hover:bg-white/5"
              title="Delete Table"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-white/5">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-2 flex flex-col gap-1">
          <AnimatePresence>
            {data.columns.map((col) => (
              <ColumnRow
                key={col.id}
                nodeId={id}
                column={col}
                isEditing={editingColumn === col.id}
                setEditing={setEditingColumn}
                updateColumn={updateColumn}
                removeColumn={removeColumn}
              />
            ))}
          </AnimatePresence>

          <button
            onClick={() => addColumn(id)}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:text-primary hover:bg-white/5 rounded-md transition-colors w-full mt-1"
          >
            <Plus className="w-3 h-3" />
            Add Column
          </button>
        </div>

        {/* Handles */}
        <Handle
          id="left"
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all !-left-1.5 !top-1/2 !-translate-y-1/2"
        />
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all !-right-1.5 !top-1/2 !-translate-y-1/2"
        />
        <Handle
          id="top"
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all !-top-1.5 !left-1/2 !-translate-x-1/2"
        />
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!w-4 hover:!h-4 transition-all !-bottom-1.5 !left-1/2 !-translate-x-1/2"
        />
      </motion.div>
    );
  },
);

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { SQL_DATA_TYPES } from "@/constants/dataTypes";
import { ChevronDown, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ColumnRow = ({
  nodeId,
  column,
  isEditing,
  setEditing,
  updateColumn,
  removeColumn,
}: {
  nodeId: string;
  column: Column;
  isEditing: boolean;
  setEditing: (id: string | null) => void;
  updateColumn: (nodeId: string, colId: string, data: Partial<Column>) => void;
  removeColumn: (nodeId: string, colId: string) => void;
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const [localType, setLocalType] = useState(column.type);

  useEffect(() => {
    if (isEditing && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (nameRef.current) {
      updateColumn(nodeId, column.id, {
        name: nameRef.current.value,
        type: localType,
      });
    }
    setEditing(null);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded">
        <input
          ref={nameRef}
          defaultValue={column.name}
          className="bg-transparent text-text-primary text-sm w-24 outline-none border-b border-primary/50"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Name"
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 bg-transparent text-text-secondary text-xs outline-none border-b border-primary/50 font-mono hover:text-primary transition-colors">
              {localType}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 min-w-[180px] bg-card border border-border rounded-md shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 origin-top">
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                {SQL_DATA_TYPES.map((type) => (
                  <DropdownMenu.Item
                    key={type.value}
                    className="flex flex-col gap-0.5 px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer hover:bg-primary/20 focus:bg-primary/20 group"
                    onSelect={() => setLocalType(type.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text-primary">
                        {type.label}
                      </span>
                      {localType === type.value && (
                        <Check className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <span className="text-[10px] text-text-secondary group-hover:text-text-primary/70">
                      {type.description}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Length Input */}
        <input
          defaultValue={column.length || ""}
          className="bg-transparent text-text-secondary text-xs w-12 outline-none border-b border-primary/50 font-mono text-center"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          onChange={(e) =>
            updateColumn(nodeId, column.id, { length: e.target.value })
          }
          placeholder="Len"
        />

        <div className="flex items-center ml-auto">
          <button onClick={handleSave} className="p-1 hover:text-green-500">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded group transition-colors cursor-pointer"
    >
      <div
        className="flex items-center gap-2 flex-1"
        onDoubleClick={() => setEditing(column.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateColumn(nodeId, column.id, {
              isPrimaryKey: !column.isPrimaryKey,
            });
          }}
          className={clsx(
            "transition-colors",
            column.isPrimaryKey
              ? "text-primary"
              : "text-text-secondary/20 hover:text-text-secondary",
          )}
        >
          <KeyRound className="w-3 h-3" />
        </button>
        <span
          className={clsx(
            "text-sm",
            column.isPrimaryKey && "font-medium text-primary",
          )}
        >
          {column.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-text-secondary font-mono group-hover:text-text-primary transition-colors cursor-help border-b border-dotted border-text-secondary/30">
                {column.type.toUpperCase()}
                {column.length ? `(${column.length})` : ""}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="z-50 bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-xs shadow-md border border-border animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
            >
              <p>
                {SQL_DATA_TYPES.find((t) => t.value === column.type)
                  ?.description || "Custom Type"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          onClick={() => removeColumn(nodeId, column.id)}
          className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};
