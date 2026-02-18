"use client";

import { motion } from "framer-motion";
import { Database, Key, User, FileText, Hash, Mail } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingEditorPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : 0)); // Loop functionality
    }, 3000);
    // Actually, a continuous sequence is better. simple delay based animations.
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* Grid Background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] opacity-[0.05] pointer-events-none">
        {Array.from({ length: 1600 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/20" />
        ))}
      </div>

      {/* Floating Elements Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Table 1: Users */}
        <MockTable
          title="users"
          x={-120}
          y={-50}
          delay={0.5}
          columns={[
            { name: "id", type: "UUID", icon: Key, isPk: true },
            { name: "email", type: "VARCHAR", icon: Mail },
            { name: "name", type: "VARCHAR", icon: User },
          ]}
        />

        {/* Table 2: Posts */}
        <MockTable
          title="posts"
          x={120}
          y={50}
          delay={1.5}
          columns={[
            { name: "id", type: "UUID", icon: Key, isPk: true },
            { name: "title", type: "VARCHAR", icon: FileText },
            { name: "user_id", type: "UUID", icon: Hash, isFk: true },
          ]}
        />

        {/* Connection Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <motion.path
            d="M 330 180 C 400 180 400 280 470 280"
            fill="none"
            // Users Right Handle: CenterX - 120 + Width/2, CenterY - 50 + RowOffset ?
            // Let's try simpler: Absolute positioning relative to a known Frame size or percentage.
            // Re-calculating:
            // Users @ x=-120 (approx left 35%), y=-50 (top 40%)
            // Posts @ x=120 (approx left 65%), y=50 (top 60%)
            // Let's use specific hardcoded path that looks correct for these standard positions.
            // Let's use specific hardcoded path that looks correct for these standard positions.
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 2.5, ease: "easeInOut" }}
          />
          <motion.circle
            cx="330"
            cy="180"
            r="4"
            fill="#3b82f6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5 }}
          />
          <motion.circle
            cx="470"
            cy="280"
            r="4"
            fill="#3b82f6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5 }}
          />
        </svg>
      </div>
    </div>
  );
}

function MockTable({ title, x, y, delay, columns }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x, y }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ duration: 0.5, delay, type: "spring" }}
      className="absolute w-48 bg-sidebar border border-border rounded-lg shadow-xl overflow-hidden z-20"
      style={{ left: "50%", top: "50%", marginLeft: x - 96, marginTop: y - 80 }} // Centering logic
    >
      <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs font-bold text-text-primary capitalize">
          {title}
        </span>
      </div>
      <div className="p-2 flex flex-col gap-1">
        {columns.map((col: any, i: number) => (
          <motion.div
            key={col.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 + i * 0.1 }}
            className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded text-[10px]"
          >
            <div className="flex items-center gap-2 text-text-secondary">
              <col.icon className="w-3 h-3" />
              <span className={col.isPk ? "text-primary font-bold" : ""}>
                {col.name}
              </span>
            </div>
            <span className="font-mono opacity-50">{col.type}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
