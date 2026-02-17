"use client";

import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { memo } from "react";

export const RelationshipEdge = memo(
  ({
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
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 20,
    });

    const EDGE_COLORS = {
      "1:1": "var(--color-primary, #3b82f6)",
      "1:N": "var(--color-success, #10b981)",
      "N:M": "#a855f7",
    } as const;

    const edgeType = (data?.type as keyof typeof EDGE_COLORS) || "N:M";
    const baseColor = EDGE_COLORS[edgeType];
    const strokeColor = selected ? "#ffffff" : baseColor;
    const strokeWidth = selected ? 3 : 2;

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            transition: "stroke 0.2s, stroke-width 0.2s",
          }}
        />
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`bg-card/80 backdrop-blur px-2 py-1 rounded border border-border text-xs text-text-secondary transition-opacity ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
          >
            {String(data?.label)}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  },
);

RelationshipEdge.displayName = "RelationshipEdge";
