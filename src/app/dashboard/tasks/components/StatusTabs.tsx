import React from "react";
import { StatusFilter } from "../types";

interface StatusTabsProps {
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

export function StatusTabs({ statusFilter, setStatusFilter, counts }: StatusTabsProps) {
  const TABS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "paused", label: "Paused" },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-zinc-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setStatusFilter(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            statusFilter === tab.id
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                statusFilter === tab.id ? "bg-purple-500/20 text-purple-300" : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {counts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
