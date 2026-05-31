"use client";

import React, { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { apiClient } from "@/services/api-client";

import { LeaderboardItem } from "../types";


interface AwardBonusModalProps {
  user: LeaderboardItem;
  monthLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AwardBonusModal({ user, monthLabel, onClose, onSuccess }: AwardBonusModalProps) {
  const [bonusAmount, setBonusAmount] = useState<string>(
    user.rank === 1 ? "5000" : user.rank === 2 ? "3000" : user.rank === 3 ? "2000" : "1000"
  );
  const [awarding, setAwarding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwarding(true);
    setSuccessMessage(null);
    try {
      const amountNum = parseFloat(bonusAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid positive bonus amount.");
      }

      const res = await apiClient.post<any, { success: boolean; message: string }>("/admin/leadership/award-bonus", {
        username: user.username,
        rankPosition: user.rank,
        amount: amountNum,
        monthLabel,
      });

      if (res && res.success) {
        setSuccessMessage(`₦${amountNum.toLocaleString()} awarded successfully to ${user.name}!`);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || "Failed to award bonus.");
    } finally {
      setAwarding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-purple-400">Award Cash Payout</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 font-bold text-xs uppercase cursor-pointer"
          >
            Close
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold animate-pulse">
              ✓
            </div>
            <p className="text-sm font-bold text-zinc-200">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Recipient</span>
              <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-purple-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-zinc-200 block">{user.name}</span>
                  <span className="text-[10px] text-zinc-550 block">Rank #{user.rank} Position</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                Bonus Amount (₦)
              </label>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                required
                placeholder="Enter amount"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-650 outline-none focus:border-purple-500 font-bold"
              />
              <div className="flex gap-2.5 pt-1">
                {["1000", "2000", "3000", "5000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBonusAmount(preset)}
                    className={`text-[10px] font-black tracking-wider py-1 px-2.5 border rounded-lg transition cursor-pointer ${
                      bonusAmount === preset
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                        : "border-zinc-800 bg-zinc-950/30 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    ₦{Number(preset).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex flex-col gap-2">
              <button
                type="submit"
                disabled={awarding}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-zinc-50 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
              >
                {awarding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Awarding...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5" />
                    <span>Confirm Payout</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
