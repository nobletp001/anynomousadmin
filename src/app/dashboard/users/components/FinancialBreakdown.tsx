import React from "react";
import { formatAmount } from "../utils";

interface FinancialBreakdownProps {
  stats: {
    taskEarnings: number;
    referralEarnings: number;
    taskDeductions: number;
    totalClaimed: number;
    availableBalance: number;
    violationDebt: number;
  };
}

export function FinancialBreakdown({ stats }: FinancialBreakdownProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Financial breakdown</h4>
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Task Earnings</span>
          <span className="text-zinc-200 font-medium">{formatAmount(stats.taskEarnings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Referral Commissions</span>
          <span className="text-zinc-200 font-medium">{formatAmount(stats.referralEarnings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400 text-red-400">Rejection Penalties</span>
          <span className="text-red-400 font-medium">−{formatAmount(stats.taskDeductions)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Total Claimed/Withdrawn</span>
          <span className="text-zinc-200 font-medium">−{formatAmount(stats.totalClaimed)}</span>
        </div>
        <div className="h-px bg-zinc-800/60 my-2" />
        <div className="flex justify-between font-semibold">
          <span className="text-purple-300">Available Balance</span>
          <span className="text-purple-300">{formatAmount(stats.availableBalance)}</span>
        </div>
        {stats.violationDebt > 0 && (
          <div className="flex justify-between font-semibold text-red-400 mt-1">
            <span>Violation Debt</span>
            <span>{formatAmount(stats.violationDebt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
