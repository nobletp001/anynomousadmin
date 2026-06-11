import React from "react";
import { CheckCircle2 } from "lucide-react";

interface PreviousPayoutsListProps {
  previousPayouts: any[];
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function PreviousPayoutsList({ previousPayouts }: PreviousPayoutsListProps) {
  if (previousPayouts.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
        Previous Payouts ({previousPayouts.length})
      </p>
      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {previousPayouts.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-zinc-400">
                {p.paidAt
                  ? new Date(p.paidAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
                {p.paidBy ? ` by ${p.paidBy}` : ""}
              </span>
            </div>
            <span className="text-xs font-bold text-zinc-200">{fmt2(p.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
