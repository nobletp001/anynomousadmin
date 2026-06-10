import React from "react";
import { Wallet } from "lucide-react";
import { PayoutClaim } from "../types";
import { PayoutRequestRow } from "./PayoutRequestRow";

interface PayoutRequestsTabProps {
  requests: PayoutClaim[];
  onAction: (id: number, status: "paid" | "rejected") => void;
  onViewBreakdown: (claim: PayoutClaim) => void;
  disabled: boolean;
}

export function PayoutRequestsTab({ requests, onAction, onViewBreakdown, disabled }: PayoutRequestsTabProps) {
  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Wallet className="w-5 h-5 opacity-40" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-zinc-300">No pending payout requests</p>
            <p className="text-xs text-zinc-500 mt-1">All creator withdrawal claims have been processed.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/40">
          {requests.map((r) => (
            <PayoutRequestRow
              key={r.id}
              r={r}
              onAction={onAction}
              onViewBreakdown={onViewBreakdown}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
