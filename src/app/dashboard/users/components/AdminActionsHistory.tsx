import React, { useState } from "react";
import { Copy, Check, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui";
import { AdminAction } from "../types";
import { formatDateTime, formatAmount } from "../utils";
import { apiClient } from "@/services/api-client";

interface AdminActionsHistoryProps {
  actions: AdminAction[];
  onCopyRef: (refId: string) => void;
  copiedId: string | null;
  onReverseSuccess?: () => void;
}

export function AdminActionsHistory({ actions, onCopyRef, copiedId, onReverseSuccess }: AdminActionsHistoryProps) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [reversingId, setReversingId] = useState<number | null>(null);
  const [reverseError, setReverseError] = useState<string>("");

  const handleReverse = async (act: AdminAction) => {
    setReversingId(act.id);
    setReverseError("");
    try {
      await apiClient.post(`/admin/actions/${act.id}/reverse`);
      setConfirmingId(null);
      onReverseSuccess?.();
    } catch (err: any) {
      setReverseError(err.response?.data?.error || err.message || "Failed to reverse action");
    } finally {
      setReversingId(null);
    }
  };

  const isReversible = (act: AdminAction) =>
    (act.actionType === "deducted" || act.actionType === "additional") &&
    act.amount > 0 &&
    !act.message.startsWith("[REVERSAL of ");

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Admin Actions History</h4>
      <div className="border border-zinc-800 rounded-xl bg-zinc-955/20 p-4 space-y-4 max-h-[320px] overflow-y-auto">
        {!actions || actions.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-8">No admin actions recorded for this user.</p>
        ) : (
          actions.map((act) => (
            <div key={act.id} className="border border-zinc-800/60 bg-zinc-900/30 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    act.actionType === "warning"
                      ? "warning"
                      : act.actionType === "strike"
                        ? "danger"
                        : act.actionType === "deducted"
                          ? "danger"
                          : act.actionType === "additional"
                            ? "success"
                            : "default"
                  }
                >
                  {act.actionType === "warning"
                    ? "Warning"
                    : act.actionType === "strike"
                      ? "Strike"
                      : act.actionType === "deducted"
                        ? "Penalty Deduction"
                        : act.actionType === "additional"
                          ? "Bonus Addition"
                          : "Support Notice"}
                </Badge>
                <span className="text-[10px] text-zinc-550 font-mono">{formatDateTime(act.createdAt)}</span>
              </div>

              <p className="text-zinc-305 leading-relaxed break-words">{act.message}</p>

              {act.amount > 0 && (
                <div className="text-[11px] font-bold">
                  {act.actionType === "deducted" ? (
                    <span className="text-red-400">Deduction: -{formatAmount(act.amount)}</span>
                  ) : (
                    <span className="text-emerald-400">Addition: +{formatAmount(act.amount)}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2 text-[10px] text-zinc-555 font-mono">
                <span>ID: {act.referenceId}</span>
                <div className="flex items-center gap-1.5">
                  {isReversible(act) && (
                    <button
                      onClick={() => {
                        setConfirmingId(act.id);
                        setReverseError("");
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/20 transition-colors text-[10px] font-semibold"
                      title="Reverse this action"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reverse
                    </button>
                  )}
                  <button
                    onClick={() => onCopyRef(act.referenceId)}
                    className="p-1 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
                    title="Copy Reference ID"
                  >
                    {copiedId === act.referenceId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Inline confirmation panel */}
              {confirmingId === act.id && (
                <div className="mt-1 p-3 bg-zinc-850/60 border border-orange-500/30 rounded-lg space-y-2">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Reverse this {act.actionType === "deducted" ? "deduction" : "addition"} of{" "}
                    <span className="font-bold text-zinc-100">{formatAmount(act.amount)}</span>?
                    {act.actionType === "deducted"
                      ? " A compensating addition will be credited to the user."
                      : " A compensating deduction will be applied to the user."}
                  </p>
                  {reverseError && <p className="text-[10px] text-red-400">{reverseError}</p>}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setConfirmingId(null);
                        setReverseError("");
                      }}
                      disabled={reversingId === act.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-[10px]"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReverse(act)}
                      disabled={reversingId === act.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-[10px] font-semibold disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {reversingId === act.id ? "Reversing..." : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
