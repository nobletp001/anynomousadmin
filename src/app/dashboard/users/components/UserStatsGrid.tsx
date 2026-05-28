import React from "react";
import { formatAmount } from "../utils";

interface UserStatsGridProps {
  stats: {
    submissions: {
      pending: number;
      approved: number;
      rejected: number;
    };
    availableBalance: number;
  };
}

export function UserStatsGrid({ stats }: UserStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-zinc-900 border border-zinc-800/60 p-3 rounded-xl text-center">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Pending Tasks</p>
        <p className="text-lg font-bold text-amber-400 mt-1">{stats.submissions.pending}</p>
      </div>
      <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Completed Tasks</p>
        <p className="text-lg font-bold text-emerald-450 mt-1">{stats.submissions.approved}</p>
      </div>
      <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Rejected Tasks</p>
        <p className="text-lg font-bold text-red-400 mt-1">{stats.submissions.rejected}</p>
      </div>
      <div className="bg-zinc-950/20 border border-zinc-800/60 p-3 rounded-xl text-center">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Current Balance</p>
        <p className="text-lg font-bold text-purple-400 mt-1">
          {formatAmount(stats.availableBalance)}
        </p>
      </div>
    </div>
  );
}
