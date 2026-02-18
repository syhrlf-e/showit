"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { KeyRound, MoreVertical, Plus, Trash2, X, Palette } from "lucide-react";
import { type TableData, type Column } from "../../types/erd";
import { motion, AnimatePresence } from "framer-motion";
import { useERDStore } from "@/store/erdStore";
import { clsx } from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const TABLE_COLORS = [
  {
    name: "Default",
    value: "bg-sidebar border-border",
    preview: "bg-gray-600",
  },
  {
    name: "Blue",
    value: "bg-blue-500/10 border-blue-500/50",
    preview: "bg-blue-500",
  },
  {
    name: "Green",
    value: "bg-emerald-500/10 border-emerald-500/50",
    preview: "bg-emerald-500",
  },
  {
    name: "Red",
    value: "bg-red-500/10 border-red-500/50",
    preview: "bg-red-500",
  },
  {
    name: "Orange",
    value: "bg-orange-500/10 border-orange-500/50",
    preview: "bg-orange-500",
  },
  {
    name: "Purple",
    value: "bg-purple-500/10 border-purple-500/50",
    preview: "bg-purple-500",
  },
  {
    name: "Cyan",
    value: "bg-cyan-500/10 border-cyan-500/50",
    preview: "bg-cyan-500",
  },
  {
    name: "Pink",
    value: "bg-pink-500/10 border-pink-500/50",
    preview: "bg-pink-500",
  },
];

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
        transition={{
          duration: 0.3,
          ease: "easeOut",
          delay: data.animationDelay || 0,
        }}
        className={clsx(
          "bg-card border rounded-lg shadow-lg min-w-[240px] transition-all",
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
        )}
      >
        <div
          className={clsx(
            "px-4 py-3 border-b flex items-center justify-between group transition-colors rounded-t-lg",
            data.headerColor ? data.headerColor : "bg-sidebar border-border",
          )}
        >
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
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-white/5"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-[160px] bg-card border border-border rounded-md shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="flex items-center justify-between px-2 py-1.5 text-xs rounded-sm outline-none cursor-pointer hover:bg-white/5 text-text-primary group data-[state=open]:bg-white/5">
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary" />
                        <span>Table Color</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-text-secondary" />
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="z-50 min-w-[140px] bg-card border border-border rounded-md shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 ml-1"
                        sideOffset={2}
                      >
                        <DropdownMenu.Label className="text-[10px] font-semibold text-text-secondary px-2 py-1">
                          Select Color
                        </DropdownMenu.Label>
                        {TABLE_COLORS.map((color) => (
                          <DropdownMenu.Item
                            key={color.name}
                            onSelect={() =>
                              updateNode(id, { headerColor: color.value })
                            }
                            className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm outline-none cursor-pointer hover:bg-white/5 group"
                          >
                            <div
                              className={clsx(
                                "w-3 h-3 rounded-full border border-border/50",
                                color.preview,
                              )}
                            />
                            <span className="text-text-primary">
                              {color.name}
                            </span>
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  <div className="h-px bg-border my-1" />

                  <DropdownMenu.Item
                    onSelect={() => deleteNode(id)}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm outline-none cursor-pointer hover:bg-red-500/10 text-red-500 hover:text-red-400 group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Table</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

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
      </motion.div>
    );
  },
);

TableNode.displayName = "TableNode";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { SQL_DATA_TYPES } from "@/constants/dataTypes";
import { ChevronDown, Check, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded group transition-colors cursor-pointer relative">
      <Handle
        id={`target-${column.id}`}
        type="target"
        position={Position.Left}
        className={clsx(
          "!w-2.5 !h-2.5 !rounded-full !border-2 !transition-all !duration-150",
          column.isPrimaryKey
            ? "!bg-amber-400 !border-amber-500/70"
            : column.isForeignKey
              ? "!bg-primary !border-primary/70"
              : "!bg-transparent !border-border hover:!bg-primary/50 hover:!border-primary",
          "!-left-[13px] z-50",
        )}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
      <Handle
        id={`source-${column.id}`}
        type="source"
        position={Position.Right}
        className={clsx(
          "!w-2.5 !h-2.5 !rounded-full !border-2 !transition-all !duration-150",
          column.isPrimaryKey
            ? "!bg-amber-400 !border-amber-500/70"
            : column.isForeignKey
              ? "!bg-primary !border-primary/70"
              : "!bg-transparent !border-border hover:!bg-primary/50 hover:!border-primary",
          "!-right-[13px] z-50",
        )}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
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
              ? "text-primary opacity-100"
              : "text-text-secondary/20 hover:text-text-secondary opacity-0",
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
    </div>
  );
};
