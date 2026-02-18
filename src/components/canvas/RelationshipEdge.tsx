"use client";

import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";
import { memo, useState } from "react";
import { X } from "lucide-react";

const EDGE_COLORS = {
  "1:1": "#3b82f6", // blue
  "1:N": "#10b981", // green
  "N:M": "#a855f7", // purple
} as const;

const RELATION_LABELS = {
  "1:1": "1 : 1",
  "1:N": "1 : N",
  "N:M": "N : M",
} as const;

// Crow's foot SVG markers are defined in ERDCanvas via <defs>
// Here we render the edge path + label + delete button

export const RelationshipEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    selected,
  }: EdgeProps) => {
    const [hovered, setHovered] = useState(false);
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 16,
    });

    const edgeType = (data?.type as keyof typeof EDGE_COLORS) || "1:N";
    const baseColor = EDGE_COLORS[edgeType];
    const strokeColor = selected ? "#ffffff" : hovered ? "#ffffff" : baseColor;
    const strokeWidth = selected || hovered ? 2.5 : 1.5;
    const labelText = RELATION_LABELS[edgeType];

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    };

    const isVisible = selected || hovered;

    return (
      <>
        {/* Invisible wider path for easier hover/click */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ cursor: "pointer" }}
        />

        {/* Actual visible edge */}
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            strokeDasharray: edgeType === "1:1" ? "6 3" : "none",
            transition: "stroke 0.2s, stroke-width 0.2s",
            filter: isVisible ? `drop-shadow(0 0 4px ${baseColor}80)` : "none",
          }}
        />

        <EdgeLabelRenderer>
          {/* Relation type badge - always visible */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider border transition-all duration-200"
              style={{
                backgroundColor: `${baseColor}20`,
                borderColor: `${baseColor}60`,
                color: baseColor,
                boxShadow: isVisible ? `0 0 8px ${baseColor}40` : "none",
                opacity: isVisible ? 1 : 0.7,
              }}
            >
              {/* Source dot */}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: baseColor }}
              />
              {labelText}
              {/* Target dot */}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: baseColor }}
              />
            </div>
          </div>

          {/* Delete button - visible on hover/selected */}
          {isVisible && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 28}px)`,
                pointerEvents: "all",
              }}
            >
              <button
                onClick={handleDelete}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                title="Delete relation"
              >
                <X className="w-2.5 h-2.5 text-red-400" />
              </button>
            </div>
          )}
        </EdgeLabelRenderer>
      </>
    );
  },
);

RelationshipEdge.displayName = "RelationshipEdge";
