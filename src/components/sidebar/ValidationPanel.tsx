"use client";

import { useState } from "react";
import {
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Table2,
} from "lucide-react";
import {
  useERDValidation,
  type ValidationIssue,
  type ValidationSeverity,
} from "@/hooks/useERDValidation";
import { useERDStore } from "@/store/erdStore";

const SEVERITY_CONFIG: Record<
  ValidationSeverity,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  error: {
    icon: <XCircle className="w-3.5 h-3.5 shrink-0" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  warning: {
    icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  info: {
    icon: <Info className="w-3.5 h-3.5 shrink-0" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
};

function IssueCard({ issue }: { issue: ValidationIssue }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity];

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-2.5 p-3 text-left"
      >
        <span className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${cfg.color}`}>{issue.title}</p>
        </div>
        <span className={`mt-0.5 ${cfg.color} shrink-0`}>
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-text-secondary leading-relaxed">
            {issue.description}
          </p>
          {issue.affectedTables && issue.affectedTables.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.affectedTables.filter(Boolean).map((table) => (
                <span
                  key={table}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                >
                  <Table2 className="w-2.5 h-2.5" />
                  {table}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ValidationPanel() {
  const { issues, errorCount, warningCount } = useERDValidation();
  const nodes = useERDStore((state) => state.nodes);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <ShieldCheck className="w-10 h-10 text-text-secondary/30" />
        <p className="text-sm text-text-secondary/50">
          Generate schema dulu untuk melihat validasi
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-sidebar/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">
              Validasi Schema
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                <XCircle className="w-2.5 h-2.5" />
                {errorCount} Error
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-2.5 h-2.5" />
                {warningCount} Warning
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-2.5 h-2.5" />
                Valid
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] text-text-secondary/50 mt-1">
          {nodes.length} tabel · {issues.length} temuan
        </p>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Errors first */}
        {issues
          .filter((i) => i.severity === "error")
          .map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}

        {/* Then warnings */}
        {issues
          .filter((i) => i.severity === "warning")
          .map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}

        {/* Then info */}
        {issues
          .filter((i) => i.severity === "info")
          .map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
      </div>
    </div>
  );
}
