"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Loader2, ShieldAlert, Target, Plus, Trash2, Edit3, ArrowRight } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { Goal, GoalWinnersResponse } from "./types";
import { CreateGoalModal } from "./components/CreateGoalModal";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Modal controls
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Detailed selected month winners view
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [winnersData, setWinnersData] = useState<GoalWinnersResponse | null>(null);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [winnersError, setWinnersError] = useState<string | null>(null);
  const [winnersPage, setWinnersPage] = useState(1);

  const fetchGoals = async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await apiClient.get<any, { success: boolean; data: Goal[] }>("/admin/goals");
      if (res && res.success) {
        setGoals(res.data);
        // Automatically select the first month if one exists and none is selected
        if (res.data.length > 0 && !selectedMonth) {
          setSelectedMonth(res.data[0].month);
        }
      } else {
        setListError("Failed to load monthly campaigns.");
      }
    } catch (err: any) {
      setListError(err.message || "Failed to load monthly campaigns.");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchWinners = async (month: string, pageNum: number) => {
    setLoadingWinners(true);
    setWinnersError(null);
    try {
      const res = await apiClient.get<any, { success: boolean; data: GoalWinnersResponse }>(
        `/admin/goals/${month}/users?page=${pageNum}&limit=20`
      );
      if (res && res.success) {
        setWinnersData(res.data);
      } else {
        setWinnersError("Failed to load monthly winners leaderboard.");
      }
    } catch (err: any) {
      setWinnersError(err.message || "Failed to load monthly winners.");
    } finally {
      setLoadingWinners(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchWinners(selectedMonth, winnersPage);
    }
  }, [selectedMonth, winnersPage]);

  const handleSaveGoal = async (payload: any) => {
    try {
      const res = await apiClient.post<any, { success: boolean }>("/admin/goals", payload);
      if (res && res.success) {
        fetchGoals();
        if (selectedMonth === payload.month) {
          fetchWinners(payload.month, winnersPage);
        }
      } else {
        throw new Error("Failed to save goal settings.");
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to save monthly target.");
    }
  };

  const handleDeleteGoal = async (id: number, month: string) => {
    if (!confirm(`Are you sure you want to delete the goal configurations for ${month}?`)) {
      return;
    }
    try {
      const res = await apiClient.delete<any, { success: boolean }>(`/admin/goals/${id}`);
      if (res && res.success) {
        fetchGoals();
        if (selectedMonth === month) {
          setSelectedMonth(null);
          setWinnersData(null);
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete target goal.");
    }
  };

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Target className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Campaign Target Goals</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure monthly targets for referrals, tasks completed by referrals, and place rewards.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors self-start cursor-pointer shadow-lg shadow-purple-650/10 border border-purple-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Monthly Goal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Goal Cards List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" /> Monthly Campaigns
          </h2>

          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2.5 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-650">
                Loading periods...
              </span>
            </div>
          ) : listError ? (
            <div className="p-4 rounded-xl bg-red-955/5 border border-red-900/10 flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <div className="text-xs font-semibold">{listError}</div>
            </div>
          ) : goals.length === 0 ? (
            <div className="py-12 px-6 text-center border border-dashed border-zinc-800 rounded-2xl space-y-2">
              <p className="text-sm font-semibold text-zinc-450">No campaigns active</p>
              <p className="text-xs text-zinc-600 font-medium">
                Click &quot;Create Monthly Goal&quot; to set up your first target goal.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {goals.map((g) => {
                const isActive = selectedMonth === g.month;
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedMonth(g.month);
                      setWinnersPage(1);
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? "bg-zinc-850/60 border-purple-500/50 shadow-lg shadow-purple-550/5 text-zinc-100"
                        : "bg-zinc-900/30 border-zinc-805/85 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-black tracking-wide">{formatMonthName(g.month)}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        Targets: {g.targetReferrals} Ref / {g.targetReferralTasks} Tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGoal(g);
                          setShowCreateModal(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(g.id, g.month);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform duration-200 ${isActive ? "translate-x-0.5 text-purple-400" : "text-zinc-650 group-hover:translate-x-0.5 group-hover:text-zinc-400"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Winner details and list of earners */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-zinc-500" /> Leaderboard Contenders
          </h2>

          {selectedMonth ? (
            loadingWinners ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2.5 bg-zinc-900/10 border border-zinc-850 rounded-3xl">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Calculating earn rankings...
                </span>
              </div>
            ) : winnersError ? (
              <div className="p-6 rounded-3xl bg-red-955/5 border border-red-500/15 flex items-center gap-4 text-red-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div className="text-xs font-semibold">{winnersError}</div>
              </div>
            ) : winnersData ? (
              <div className="space-y-6">
                {/* Month Details Widget */}
                <div className="p-5 rounded-2xl bg-purple-550/[0.02] border border-purple-550/10 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Period</span>
                    <span className="text-sm font-black text-zinc-200">{formatMonthName(winnersData.goal.month)}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Referral Targets
                    </span>
                    <span className="text-sm font-black text-zinc-200">
                      {winnersData.goal.targetReferrals} referrals &amp; {winnersData.goal.targetReferralTasks} tasks
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Cash Prize Tiers
                    </span>
                    <span className="text-sm font-black text-zinc-200">
                      {winnersData.goal.rewards.length} placements configured
                    </span>
                  </div>
                </div>

                {/* Earner List Table */}
                <div className="border border-zinc-800/80 bg-zinc-900/15 backdrop-blur-md rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
                    <h3 className="text-xs font-extrabold text-zinc-250 uppercase tracking-widest">
                      Earnings Rankings Leaderboard
                    </h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 rounded-full px-2.5 py-1 font-bold">
                      {winnersData.totalQualified} earners qualified
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/60 text-zinc-500 font-bold uppercase text-[9px] tracking-wider bg-zinc-950/20">
                          <th className="py-3 px-5 text-center w-16">Rank</th>
                          <th className="py-3 px-4">User Details</th>
                          <th className="py-3 px-4 text-center">Referrals</th>
                          <th className="py-3 px-4 text-center">Referrals Task Count</th>
                          <th className="py-3 px-5 text-right">Cash Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {winnersData.users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-550 font-medium italic">
                              No active earners found in system.
                            </td>
                          </tr>
                        ) : (
                          winnersData.users.map((item, index) => {
                            const isWinner = item.hasMetGoal;
                            const medals = ["🥇", "🥈", "🥉"];

                            return (
                              <tr
                                key={index}
                                className={`hover:bg-zinc-850/20 transition-colors ${isWinner ? "bg-purple-950/5" : ""}`}
                              >
                                <td className="py-3 px-5 text-center font-bold text-sm">
                                  {isWinner ? (
                                    medals[item.rank! - 1] || `${item.rank}th`
                                  ) : (
                                    <span className="text-zinc-650 text-xs font-semibold">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-zinc-200">{item.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-medium">@{item.username}</div>
                                </td>
                                <td
                                  className={`py-3 px-4 text-center font-mono font-bold text-sm ${item.referralsCount >= winnersData.goal.targetReferrals ? "text-emerald-400" : "text-zinc-500"}`}
                                >
                                  {item.referralsCount}
                                </td>
                                <td
                                  className={`py-3 px-4 text-center font-mono font-bold text-sm ${item.referralTasksCount >= winnersData.goal.targetReferralTasks ? "text-emerald-400" : "text-zinc-500"}`}
                                >
                                  {item.referralTasksCount}
                                </td>
                                <td className="py-3 px-5 text-right font-black font-mono text-zinc-100 text-sm">
                                  {item.rewardAmount > 0 ? (
                                    <span className="text-purple-400">₦{item.rewardAmount.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-zinc-600 text-xs">₦0</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {(() => {
                    const totalPages = Math.ceil(winnersData.total / winnersData.limit) || 1;
                    if (totalPages <= 1) return null;
                    return (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/40 bg-zinc-900/10">
                        <p className="text-xs text-zinc-500 font-semibold">
                          Showing{" "}
                          <span className="text-zinc-300 font-bold">{(winnersPage - 1) * winnersData.limit + 1}</span>{" "}
                          to{" "}
                          <span className="text-zinc-300 font-bold">
                            {Math.min(winnersPage * winnersData.limit, winnersData.total)}
                          </span>{" "}
                          of <span className="text-zinc-300 font-bold">{winnersData.total}</span> users
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWinnersPage((p) => Math.max(1, p - 1))}
                            disabled={winnersPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setWinnersPage((p) => Math.min(totalPages, p + 1))}
                            disabled={winnersPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-xs font-bold text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null
          ) : (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2">
              <Trophy className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No month selected</p>
              <p className="text-xs text-zinc-600 font-medium max-w-xs mx-auto">
                Select a monthly campaign period on the left side to inspect earners progress and place rankings.
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}
