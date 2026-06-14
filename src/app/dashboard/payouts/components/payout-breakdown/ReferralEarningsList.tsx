import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

interface ReferralEarningsListProps {
  referralBreakdown: any[];
  referralAmount: number;
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function ReferralEarningsList({ referralBreakdown, referralAmount }: ReferralEarningsListProps) {
  const withdrawing = referralBreakdown;

  if (withdrawing.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 mb-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-350">
            Referral Earnings ({withdrawing.length})
          </span>
        </div>
        <span className="text-[10px] font-bold text-purple-400 uppercase">
          Cleared: ₦{referralAmount.toLocaleString()}
        </span>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
        {withdrawing.map((r) => (
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
            {r.recentTasks && r.recentTasks.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800/40 space-y-1">
                <p className="text-[9px] text-zinc-500 uppercase font-semibold">Contributing completions:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {r.recentTasks.map((t: any) => (
                    <div
                      key={t.submissionId}
                      className="flex items-center justify-between text-[10px] bg-zinc-950/30 px-2 py-1 rounded"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-zinc-300 truncate font-medium">{t.taskTitle}</span>
                        {t.isDouble && (
                          <span className="px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            Double
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${t.contribution > 0 ? "text-purple-400" : "text-zinc-600"}`}
                      >
                        +{fmt2(t.contribution)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
