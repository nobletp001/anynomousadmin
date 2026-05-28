import React from "react";
import { Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui";
import { AdminAction } from "../types";
import { formatDateTime, formatAmount } from "../utils";

interface AdminActionsHistoryProps {
  actions: AdminAction[];
  onCopyRef: (refId: string) => void;
  copiedId: string | null;
}

export function AdminActionsHistory({ actions, onCopyRef, copiedId }: AdminActionsHistoryProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Admin Actions History
      </h4>
      <div className="border border-zinc-800 rounded-xl bg-zinc-955/20 p-4 space-y-4 max-h-[320px] overflow-y-auto">
        {!actions || actions.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-8">
            No admin actions recorded for this user.
          </p>
        ) : (
          actions.map((act) => (
            <div
              key={act.id}
              className="border border-zinc-800/60 bg-zinc-900/30 rounded-lg p-3 space-y-2 text-xs"
            >
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
                <span className="text-[10px] text-zinc-550 font-mono">
                  {formatDateTime(act.createdAt)}
                </span>
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
          ))
        )}
      </div>
    </div>
  );
}
