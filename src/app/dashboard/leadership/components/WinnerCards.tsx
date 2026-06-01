"use client";

import React from "react";
import { Trophy, Medal, Award, Star, Clock, Coins } from "lucide-react";

import { LeaderboardItem } from "../types";


interface WinnerCardsProps {
  winners: LeaderboardItem[];
  formatTime: (secs: number) => string;
  onAwardBonus: (user: LeaderboardItem) => void;
  onSelectUser: (username: string) => void;
}

export function WinnerCards({ winners, formatTime, onAwardBonus, onSelectUser }: WinnerCardsProps) {
  if (winners.length === 0) {
    return (
      <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 text-center text-zinc-500 text-xs">
        No approved micro-tasks completed in this month.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {winners.map((winner) => {
        const is1st = winner.rank === 1;
        const is2nd = winner.rank === 2;

        let borderClass = "border-zinc-800 bg-zinc-900/20";
        let badgeIcon = <Award className="w-5 h-5 text-zinc-400" />;
        let rankColor = "text-zinc-400";
        let rankLabel = "3rd Place";

        if (is1st) {
          borderClass = "border-yellow-500/20 bg-yellow-500/[0.02] shadow-yellow-500/5";
          badgeIcon = <Trophy className="w-5 h-5 text-yellow-400" />;
          rankColor = "text-yellow-400";
          rankLabel = "Winner (1st Place)";
        } else if (is2nd) {
          borderClass = "border-slate-400/20 bg-slate-400/[0.02]";
          badgeIcon = <Medal className="w-5 h-5 text-slate-400" />;
          rankColor = "text-slate-400";
          rankLabel = "Runner-Up (2nd Place)";
        }

        return (
          <div
            key={winner.username}
            className={`rounded-3xl border p-5 flex flex-col justify-between space-y-5 relative overflow-hidden backdrop-blur-md transition duration-300 hover:-translate-y-1 ${borderClass}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {badgeIcon}
                <span className={`text-[10px] font-black uppercase tracking-wider ${rankColor}`}>
                  {rankLabel}
                </span>
              </div>
              <span className="text-xl font-black text-zinc-800">#{winner.rank}</span>
            </div>

            <button
              onClick={() => onSelectUser(winner.username)}
              className="space-y-1 text-left block w-full hover:opacity-85 transition cursor-pointer group"
            >
              <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-purple-400 transition">{winner.name}</h3>
              <p className="text-xs text-zinc-500">@{winner.username}</p>
            </button>

            <div className="grid grid-cols-2 gap-3.5 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40 text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                  Tasks Completed
                </span>
                <span className="font-extrabold text-zinc-200 block">
                  {winner.tasksCompleted}
                  {winner.volunteerTasksCompleted > 0 && (
                    <span className="text-[10px] text-purple-400 font-bold ml-1">
                      ({winner.volunteerTasksCompleted} Vol)
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                  Amount Earned
                </span>
                <span className="font-extrabold text-emerald-400 block">
                  ₦{winner.amountEarned.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                  Avg. Rating
                </span>
                <span className="font-extrabold text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {winner.averageRating}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">
                  Avg. Speed
                </span>
                <span className="font-extrabold text-indigo-400 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3" />
                  {formatTime(winner.averageTimeTaken)}
                </span>
              </div>
            </div>

            <div>
              {winner.bonusAwarded ? (
                <div className="w-full py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Bonus Awarded!</span>
                </div>
              ) : (
                <button
                  onClick={() => onAwardBonus(winner)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-zinc-50 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Award Cash Bonus</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
