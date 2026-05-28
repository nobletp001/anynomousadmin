import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

interface AdminActionFormProps {
  actionType: string;
  setActionType: (type: string) => void;
  actionAmount: string;
  setActionAmount: (amt: string) => void;
  actionMessage: string;
  setActionMessage: (msg: string) => void;
  actionError: string;
  actionSuccess: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminActionForm({
  actionType, setActionType,
  actionAmount, setActionAmount,
  actionMessage, setActionMessage,
  actionError,
  actionSuccess,
  isSubmitting,
  onSubmit,
}: AdminActionFormProps) {
  const getPlaceholder = () => {
    if (actionType === "warning") return "Explain what rule was violated...";
    if (actionType === "strike") return "Provide details for the strike...";
    if (actionType === "deducted") return "Explain the penalty / deduction reasoning...";
    if (actionType === "additional") return "Explain the bonus reason...";
    return "Provide contact instructions or details for this support request...";
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">
        Send Action / Penalty
      </h4>
      <form onSubmit={onSubmit} className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-3.5 text-xs">
        {actionError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg">
            {actionSuccess}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-zinc-400 font-semibold">Action Type</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
          >
            <option value="warning">Warning Notice</option>
            <option value="strike">Account Strike</option>
            <option value="deducted">Deduct Penalty Funds</option>
            <option value="additional">Add Bonus Funds</option>
            <option value="not_supported">Not Supported (Contact CEO)</option>
          </select>
        </div>

        {(actionType === "deducted" || actionType === "additional") && (
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold">Amount (NGN)</label>
            <input
              type="number" min="1" placeholder="e.g. 500" value={actionAmount}
              onChange={(e) => setActionAmount(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-purple-500/50 transition-colors"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-zinc-400 font-semibold">Message Description</label>
          <textarea
            placeholder={getPlaceholder()} value={actionMessage}
            onChange={(e) => setActionMessage(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors min-h-[70px] resize-none"
            required
          />
        </div>

        <Button
          type="submit" size="sm" isLoading={isSubmitting} fullWidth
          variant={actionType === "additional" ? "primary" : actionType === "deducted" || actionType === "strike" ? "danger" : "secondary"}
        >
          Submit Action
        </Button>
      </form>
    </div>
  );
}
