import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Goal } from "../types";
import { Button } from "@/components/ui";

interface CreateGoalModalProps {
  goal?: Goal | null;
  onClose: () => void;
  onSave: (payload: {
    month: string;
    targetReferrals: number;
    targetReferralTasks: number;
    rewards: number[];
    encouragementText: string | null;
  }) => Promise<void>;
}

export function CreateGoalModal({ goal, onClose, onSave }: CreateGoalModalProps) {
  const [month, setMonth] = useState("");
  const [targetReferrals, setTargetReferrals] = useState("10");
  const [targetReferralTasks, setTargetReferralTasks] = useState("50");
  const [rewards, setRewards] = useState<number[]>([100000, 50000, 20000]);
  const [encouragementText, setEncouragementText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setMonth(goal.month);
      setTargetReferrals(String(goal.targetReferrals));
      setTargetReferralTasks(String(goal.targetReferralTasks));
      setRewards(goal.rewards || []);
      setEncouragementText(goal.encouragementText || "");
    } else {
      // Default to current month YYYY-MM
      const now = new Date();
      const yr = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setMonth(`${yr}-${m}`);
    }
  }, [goal]);

  const handleAddReward = () => {
    setRewards((prev) => [...prev, 0]);
  };

  const handleRewardChange = (idx: number, val: string) => {
    const num = parseInt(val.replace(/\D/g, "")) || 0;
    setRewards((prev) => {
      const clone = [...prev];
      clone[idx] = num;
      return clone;
    });
  };

  const handleRemoveReward = (idx: number) => {
    setRewards((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!month) {
      setError("Please select a month.");
      setLoading(false);
      return;
    }

    const tRef = parseInt(targetReferrals);
    const tTasks = parseInt(targetReferralTasks);

    if (isNaN(tRef) || tRef < 0 || isNaN(tTasks) || tTasks < 0) {
      setError("Targets must be non-negative integers.");
      setLoading(false);
      return;
    }

    try {
      await onSave({
        month,
        targetReferrals: tRef,
        targetReferralTasks: tTasks,
        rewards,
        encouragementText: encouragementText.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save monthly goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-955/20 shrink-0">
          <div>
            <h3 className="text-base font-bold text-zinc-100">{goal ? "Edit Monthly Goal" : "Create Monthly Goal"}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Set target goals and placement cash prize rewards.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/15 text-xs text-red-400 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Campaign Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={!!goal}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Target Referrals
              </label>
              <input
                type="number"
                min="0"
                value={targetReferrals}
                onChange={(e) => setTargetReferrals(e.target.value)}
                placeholder="e.g. 10"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Target Referral Tasks
              </label>
              <input
                type="number"
                min="0"
                value={targetReferralTasks}
                onChange={(e) => setTargetReferralTasks(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rank Cash Prizes</label>
              <button
                type="button"
                onClick={handleAddReward}
                className="flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rank
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {rewards.length === 0 ? (
                <p className="text-[11px] text-zinc-500 font-medium italic">
                  No rank rewards configured. Click &quot;Add Rank&quot; to define prizes.
                </p>
              ) : (
                rewards.map((amt, idx) => {
                  const labels = ["1st Place (🥇)", "2nd Place (🥈)", "3rd Place (🥉)"];
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="text-[11px] font-bold text-zinc-400 w-28 truncate">
                        {labels[idx] || `${idx + 1}th Place`}
                      </div>
                      <div className="flex-1 relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-550">
                          ₦
                        </span>
                        <input
                          type="text"
                          value={amt.toLocaleString()}
                          onChange={(e) => handleRewardChange(idx, e.target.value)}
                          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl pl-8 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50 font-bold font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReward(idx)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Encouragement Message
            </label>
            <textarea
              value={encouragementText}
              onChange={(e) => setEncouragementText(e.target.value)}
              placeholder="Provide a motivational note for earners..."
              rows={3}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500/50 resize-none font-medium"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-700 hover:bg-zinc-800 transition-colors text-zinc-350"
            >
              Cancel
            </button>
            <Button
              type="submit"
              isLoading={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              {goal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
