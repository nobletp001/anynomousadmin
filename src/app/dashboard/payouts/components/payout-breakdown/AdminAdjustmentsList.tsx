import React from "react";
import { Wrench } from "lucide-react";

interface AdminAdjustmentsListProps {
  adminAdjustments: any[];
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function AdminAdjustmentsList({ adminAdjustments }: AdminAdjustmentsListProps) {
  if (adminAdjustments.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="w-3.5 h-3.5 text-zinc-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Admin Adjustments ({adminAdjustments.length})
        </p>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {adminAdjustments.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900/50">
            <div className="min-w-0">
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md mr-2 ${a.actionType === "additional" ? "bg-emerald-500/10 text-emerald-450" : "bg-red-500/10 text-red-400"}`}
              >
                {a.actionType}
              </span>
              <span className="text-xs text-zinc-300 truncate">{a.message}</span>
            </div>
            <span
              className={`text-xs font-bold shrink-0 ${a.actionType === "additional" ? "text-emerald-450" : "text-red-400"}`}
            >
              {a.actionType === "additional" ? "+" : "-"}
              {fmt2(a.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
