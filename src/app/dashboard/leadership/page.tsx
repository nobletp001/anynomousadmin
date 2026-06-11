"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { WinnerCards } from "./components/WinnerCards";
import { LeaderboardTable } from "./components/LeaderboardTable";
import { AwardBonusModal } from "./components/AwardBonusModal";
import { UserBreakdownModal } from "./components/UserBreakdownModal";
import { LeaderboardItem, LeadershipResponse } from "./types";
import { MONTHS, YEARS, formatTime } from "./utils";

export default function LeadershipPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [data, setData] = useState<LeadershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bonusUser, setBonusUser] = useState<LeaderboardItem | null>(null);
  const [breakdownUser, setBreakdownUser] = useState<string | null>(null);

  const fetchLeadership = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any, LeadershipResponse>(
        `/admin/leadership?month=${selectedMonth}&year=${selectedYear}`
      );
      if (res && res.success) {
        setData(res.data);
      } else {
        setError("Failed to parse leaderboard statistics.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchLeadership();
    }
  }, [selectedMonth, selectedYear]);

  const winners = data?.leaderboard.slice(0, 3) || [];
  const otherContenders = data?.leaderboard.slice(3) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Monthly Leadership</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Calculate user rankings and award place bonuses for preceding campaign periods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Select Period</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs">Computing user leaderboard metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/10 flex items-center gap-4 text-red-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div className="text-xs font-medium">{error}</div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Placement Winners ({data?.monthLabel})
              </h2>
            </div>
            <WinnerCards
              winners={winners}
              formatTime={formatTime}
              onAwardBonus={setBonusUser}
              onSelectUser={setBreakdownUser}
            />
          </div>

          <LeaderboardTable
            leaderboard={otherContenders}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            formatTime={formatTime}
            onAwardBonus={setBonusUser}
            onSelectUser={setBreakdownUser}
          />
        </>
      )}

      {bonusUser && data && (
        <AwardBonusModal
          user={bonusUser}
          monthLabel={data.monthLabel}
          onClose={() => setBonusUser(null)}
          onSuccess={fetchLeadership}
        />
      )}

      {breakdownUser && data && (
        <UserBreakdownModal
          username={breakdownUser}
          month={selectedMonth}
          year={selectedYear}
          monthLabel={data.monthLabel}
          onClose={() => setBreakdownUser(null)}
        />
      )}
    </div>
  );
}
