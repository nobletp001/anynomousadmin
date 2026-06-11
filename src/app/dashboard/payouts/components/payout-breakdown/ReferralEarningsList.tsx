import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

interface ReferralEarningsListProps {
  referralBreakdown: any[];
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function ReferralEarningsList({ referralBreakdown }: ReferralEarningsListProps) {
  if (referralBreakdown.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Users className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-355">
          Referral Earnings ({referralBreakdown.length} referrals)
        </span>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {referralBreakdown.map((r) => (
          <div key={r.referredUsername} className="px-3 py-2.5 rounded-lg bg-zinc-900/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/dashboard/users/${r.referredUsername}`}
                  className="text-xs font-bold text-zinc-200 hover:text-purple-400 hover:underline cursor-pointer"
                >
                  @{r.referredUsername}
                </Link>
                {r.referredName && <p className="text-[10px] text-zinc-500">{r.referredName}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-purple-400">{fmt2(r.earned)}</p>
                {r.pending > 0 && <p className="text-[10px] text-zinc-500">+{fmt2(r.pending)} pending</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 rounded-full bg-zinc-800 flex-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.min(100, (r.earned / 100) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{r.approvedCount} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
