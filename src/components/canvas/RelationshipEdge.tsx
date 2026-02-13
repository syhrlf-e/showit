"use client";

import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
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
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const baseColor =
      data?.type === "1:1"
        ? "#3b82f6"
        : data?.type === "1:N"
          ? "#10b981"
          : "#a855f7";
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
