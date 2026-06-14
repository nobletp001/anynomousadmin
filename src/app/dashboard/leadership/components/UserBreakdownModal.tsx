"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { UserBreakdownResponse } from "../types";

interface UserBreakdownModalProps {
  username: string;
  month: number;
  year: number;
  monthLabel: string;
  onClose: () => void;
}

export function UserBreakdownModal({ username, month, year, monthLabel, onClose }: UserBreakdownModalProps) {
  const [data, setData] = useState<UserBreakdownResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakdown = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<any, { success: boolean; data: UserBreakdownResponse }>(
          `/admin/leadership/user-breakdown?username=${username}&month=${month}&year=${year}`
        );
        if (res && res.success) setData(res.data);
        else setError("Failed to fetch breakdown details.");
      } catch (err: any) {
        setError(err.message || "Failed to load breakdown.");
      } finally {
        setLoading(false);
      }
    };
    fetchBreakdown();
  }, [username, month, year]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5 shrink-0 bg-zinc-900/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              User Activity Summary
            </span>
            <h3 className="text-sm font-extrabold text-zinc-200 mt-0.5">{data?.user.name || username}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 font-bold text-xs uppercase cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-450 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-xs">Fetching monthly summary details...</p>
            </div>
          ) : error ? (
            <p className="text-xs text-red-400 font-medium text-center py-10">{error}</p>
          ) : (
            data && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-3.5 text-left">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                      Month Total
                    </span>
                    <span className="text-base font-black text-emerald-400 block mt-1">
                      ₦{data.summary.totalForMonth.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-3.5 text-left">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                      Tasks Income
                    </span>
                    <span className="text-base font-black text-zinc-200 block mt-1">
                      ₦{data.summary.taskEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-3.5 text-left">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                      Ref Income ({monthLabel.split(" ")[0]})
                    </span>
                    <span className="text-base font-black text-indigo-400 block mt-1">
                      ₦{data.summary.referralEarningsMonth.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-3.5 text-left">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                      Pending Refs
                    </span>
                    <span className="text-base font-black text-amber-500 block mt-1">
                      ₦{data.summary.pendingReferralMoney.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Tasks Completed */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-left">
                    Approved Tasks ({monthLabel})
                  </h4>
                  <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl divide-y divide-zinc-850 overflow-hidden">
                    {data.tasksCompleted.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">No tasks approved in this month.</p>
                    ) : (
                      data.tasksCompleted.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3.5 text-xs hover:bg-zinc-850/10"
                        >
                          <div className="space-y-0.5 max-w-[70%] text-left">
                            <span className="font-extrabold text-zinc-200 block truncate">{item.title}</span>
                            <span className="text-[9px] text-zinc-550 flex items-center gap-1.5">
                              {new Date(item.createdAt).toLocaleDateString()}
                              {item.rating && (
                                <span className="flex items-center text-amber-450 font-bold gap-0.5 ml-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-450" /> {item.rating}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="font-black text-emerald-400">₦{item.amount.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Referrals Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-left">
                    Referral breakdown ({monthLabel})
                  </h4>
                  <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl divide-y divide-zinc-850 overflow-hidden text-xs">
                    {data.referrals.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">No referred users recorded.</p>
                    ) : (
                      data.referrals.map((ref) => (
                        <div key={ref.username} className="p-3.5 hover:bg-zinc-850/10 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <span className="font-extrabold text-zinc-200 block">{ref.name}</span>
                              <span className="text-[9px] text-zinc-550 block">@{ref.username}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                                Month Cleared
                              </span>
                              <span className="font-black text-emerald-400">₦{ref.monthCleared.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 p-2.5 rounded-xl text-[10px] text-zinc-450">
                            <div className="text-left">
                              <span className="text-[9px] text-zinc-550 block uppercase tracking-wider">
                                Month Tasks
                              </span>
                              <span className="font-bold text-zinc-300">{ref.monthApprovedCount}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[9px] text-zinc-550 block uppercase tracking-wider">
                                Overall Cleared
                              </span>
                              <span className="font-bold text-zinc-300">₦{ref.overallCleared.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-550 block uppercase tracking-wider">
                                Remaining Cap
                              </span>
                              <span className="font-bold text-zinc-300">₦{ref.pending.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Adjustments */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-left">
                    Other Adjustments ({monthLabel})
                  </h4>
                  <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl divide-y divide-zinc-850 overflow-hidden text-xs">
                    {data.adjustments.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">
                        No other balance adjustments in this month.
                      </p>
                    ) : (
                      data.adjustments.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3.5 hover:bg-zinc-850/10">
                          <div className="space-y-0.5 max-w-[70%] text-left">
                            <span className="font-bold text-zinc-350 block leading-tight">{item.message}</span>
                            <span className="text-[9px] text-zinc-550 block">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span
                            className={`font-black ${item.actionType === "additional" ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {item.actionType === "additional" ? "+" : "-"}₦{item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
