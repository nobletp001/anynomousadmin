import React from "react";
import { Calendar, History, DollarSign, Activity, TrendingUp, Wallet } from "lucide-react";
import { PayoutClaim } from "../types";
import { DateFilterType } from "../hooks/usePayoutState";
import { fmt } from "../utils";
import { PayoutHistoryRow } from "./PayoutHistoryRow";

interface PayoutHistoryTabProps {
  claims: PayoutClaim[];
  dateFilter: DateFilterType;
  setDateFilter: (f: DateFilterType) => void;
  customDate: string;
  setCustomDate: (d: string) => void;
}

export function PayoutHistoryTab({
  claims,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
}: PayoutHistoryTabProps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const paidHistory = claims.filter((c) => {
    if (c.status !== "paid" || !c.paidAt) return false;
    const paidDate = new Date(c.paidAt);

    if (dateFilter === "today") return paidDate >= startOfToday;
    if (dateFilter === "yesterday") {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return paidDate >= startOfYesterday && paidDate < startOfToday;
    }
    if (dateFilter === "3days") {
      const limit = new Date(startOfToday);
      limit.setDate(limit.getDate() - 2);
      return paidDate >= limit;
    }
    if (dateFilter === "4days") {
      const limit = new Date(startOfToday);
      limit.setDate(limit.getDate() - 3);
      return paidDate >= limit;
    }
    if (dateFilter === "5days") {
      const limit = new Date(startOfToday);
      limit.setDate(limit.getDate() - 4);
      return paidDate >= limit;
    }
    if (dateFilter === "custom") {
      if (!customDate) return true;
      const [y, m, d] = customDate.split("-").map(Number);
      const targetDate = new Date(y, m - 1, d);
      const targetDateEnd = new Date(y, m - 1, d + 1);
      return paidDate >= targetDate && paidDate < targetDateEnd;
    }
    return true;
  });

  const totalPaid = paidHistory.reduce((sum, c) => sum + c.amount, 0);
  const payoutCount = paidHistory.length;
  const avgPayout = payoutCount > 0 ? totalPaid / payoutCount : 0;
  const maxPayout = paidHistory.length > 0 ? Math.max(...paidHistory.map((c) => c.amount)) : 0;

  const dateFilterOptions = [
    { val: "all", label: "All Time" },
    { val: "today", label: "Today" },
    { val: "yesterday", label: "Yesterday" },
    { val: "3days", label: "3 Days" },
    { val: "4days", label: "4 Days" },
    { val: "5days", label: "5 Days" },
    { val: "custom", label: "Custom Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Filter:
          </span>
          {dateFilterOptions.map((opt) => (
            <button
              key={opt.val}
              onClick={() => setDateFilter(opt.val as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateFilter === opt.val
                  ? "bg-zinc-805 text-purple-400 border border-zinc-700/60"
                  : "bg-zinc-950/20 text-zinc-400 border border-transparent hover:text-zinc-205"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Select Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/60"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Paid", val: fmt(totalPaid), sub: "Active filter earnings", icon: <DollarSign className="w-3.5 h-3.5" />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
          { label: "Payout Count", val: payoutCount, sub: "Claims paid out", icon: <Activity className="w-3.5 h-3.5" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
          { label: "Average Payout", val: fmt(avgPayout), sub: "Average claim volume", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
          { label: "Max Payout", val: fmt(maxPayout), sub: "Largest paid settlement", icon: <Wallet className="w-3.5 h-3.5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        ].map((c) => (
          <div key={c.label} className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200">
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">{c.label}</p>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${c.color}`}>{c.icon}</div>
            </div>
            <p className={`text-2xl font-black mt-2 ${c.label === "Total Paid" ? "text-emerald-450" : c.label === "Payout Count" ? "text-purple-450" : c.label === "Average Payout" ? "text-blue-450" : "text-amber-450"}`}>{c.val}</p>
            <p className="text-[9px] text-zinc-550 mt-1 font-semibold">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {paidHistory.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"><History className="w-5 h-5 opacity-40" /></div>
            <div>
              <p className="text-sm font-extrabold text-zinc-300">No payout records found</p>
              <p className="text-xs text-zinc-500 mt-1">No claims match the active date filter criteria.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/40">
            {paidHistory.map((historyItem) => (
              <PayoutHistoryRow key={historyItem.id} c={historyItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
