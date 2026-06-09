import React from "react";
import { RotateCcw, X } from "lucide-react";

interface ReverseSubmissionModalProps {
  username: string;
  deductedAmount: number;
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ReverseSubmissionModal({
  username,
  deductedAmount,
  isPending,
  error,
  onClose,
  onConfirm,
}: ReverseSubmissionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-zinc-100">Reverse Rejection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-300">
            This will approve <span className="font-bold text-zinc-100">@{username}</span>&apos;s submission and credit
            the task reward to their account.
          </p>
          {deductedAmount > 0 && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              The ₦{deductedAmount} deduction will also be removed from their balance.
            </p>
          )}
          <p className="text-xs text-zinc-500">
            A notification will be sent to the user. This action cannot be undone automatically.
          </p>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {(error as Error & { response?: { data?: { error?: string } } })?.response?.data?.error || error.message}
            </p>
          )}
        </div>

        <div className="p-5 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isPending ? "Reversing..." : "Confirm Reverse"}
          </button>
        </div>
      </div>
    </div>
  );
}
