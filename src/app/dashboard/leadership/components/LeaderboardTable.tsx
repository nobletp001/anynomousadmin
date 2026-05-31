"use client";

import React, { useState, useEffect } from "react";
import { Search, Star, Clock } from "lucide-react";

import { LeaderboardItem } from "../types";


interface LeaderboardTableProps {
  leaderboard: LeaderboardItem[]; searchQuery: string;
  onSearchChange: (val: string) => void; formatTime: (secs: number) => string;
  onAwardBonus: (user: LeaderboardItem) => void;
  onSelectUser: (username: string) => void;
}

export function LeaderboardTable({
  leaderboard, searchQuery, onSearchChange, formatTime, onAwardBonus, onSelectUser,
}: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredList = leaderboard.filter(
    (item) =>
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Other Contenders (Ranks 4+)</h2>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user list..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="border border-zinc-800 bg-zinc-900/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px] text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-550 bg-zinc-900/30">
              <th className="py-4 px-6 text-center">Rank</th>
              <th className="py-4 px-6">User Contender</th>
              <th className="py-4 px-6 text-center">Tasks Done</th>
              <th className="py-4 px-6 text-center">Amount Earned</th>
              <th className="py-4 px-6 text-center">Avg. Submission Rating</th>
              <th className="py-4 px-6 text-center">Avg. Response Speed</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                  {searchQuery ? "No matching users found." : "No other users recorded in this month."}
                </td>
              </tr>
            ) : (
              paginatedList.map((item) => (
                <tr key={item.username} className="hover:bg-zinc-850/10 transition-colors">
                  <td className="py-4 px-6 text-center text-zinc-400 font-bold">#{item.rank}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onSelectUser(item.username)}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition cursor-pointer group w-full"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-[10px] text-zinc-300 group-hover:border-purple-500/50 transition">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-zinc-200 group-hover:text-purple-400 transition block">{item.name}</span>
                        <span className="text-[10px] text-zinc-550 block">@{item.username}</span>
                      </div>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center text-zinc-300 font-bold">{item.tasksCompleted}</td>
                  <td className="py-4 px-6 text-center text-emerald-400 font-bold">₦{item.amountEarned.toLocaleString()}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-amber-400 inline-flex items-center gap-1 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.averageRating}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-indigo-400 font-bold">{formatTime(item.averageTimeTaken)}</td>
                  <td className="py-4 px-6 text-center">
                    {item.bonusAwarded ? (
                      <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Awarded</span>
                    ) : (
                      <button
                        onClick={() => onAwardBonus(item)}
                        className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1.5 rounded-xl border border-purple-500/20 transition cursor-pointer"
                      >
                        Bonus
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-[10px] font-bold text-zinc-400">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} contenders
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-50 cursor-pointer transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-50 cursor-pointer transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
