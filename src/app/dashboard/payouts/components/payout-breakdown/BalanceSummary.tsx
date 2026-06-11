import React from "react";
import { Banknote } from "lucide-react";
import { Row } from "./Helpers";

interface BalanceSummaryProps {
  balance: any;
  verification: any;
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function BalanceSummary({ balance, verification }: BalanceSummaryProps) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="w-3.5 h-3.5 text-zinc-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Balance Breakdown</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <Row label="Task earnings" value={fmt2(balance.totalMicroEarnings)} />
        <Row label="Referral earnings" value={fmt2(balance.clearedReferralEarnings)} />
        {balance.adminAdditions > 0 && (
          <Row label="Admin bonuses" value={fmt2(balance.adminAdditions)} color="emerald" />
        )}
        {balance.adminDeductions > 0 && (
          <Row label="Admin deductions" value={`-${fmt2(balance.adminDeductions)}`} color="red" />
        )}
        <Row label="Previously paid" value={`-${fmt2(balance.totalClaimed)}`} />
        {balance.reviewMoney > 0 && <Row label="In review (this claim)" value={`-${fmt2(balance.reviewMoney)}`} />}
        <div className="col-span-2 mt-1 pt-1.5 border-t border-zinc-800/60 flex justify-between font-extrabold">
          <span className="text-zinc-300">Available (before claim)</span>
          <span className={verification.checksOut ? "text-emerald-400" : "text-red-400"}>
            {fmt2(verification.effectiveAvailable)}
          </span>
        </div>
        <div className="col-span-2 flex justify-between font-extrabold text-sm pt-0.5">
          <span className="text-zinc-200">This claim</span>
          <span className="text-purple-300">{fmt2(verification.claimAmount)}</span>
        </div>
      </div>
    </div>
  );
}
