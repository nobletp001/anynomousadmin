import React from "react";
import { Undo2, X } from "lucide-react";

import type { BusinessReviewRequest } from "../types";
import { formatAmount, formatDate, formatRelativeAge } from "../utils";

interface WithdrawReviewRequestModalProps {
  request: BusinessReviewRequest;
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawReviewRequestModal({
  request,
  isPending,
  error,
  onClose,
  onConfirm,
}: WithdrawReviewRequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-2">
            <Undo2 className="h-4 w-4 text-amber-300" />
            <h3 className="text-sm font-bold text-zinc-100">Withdraw Review Request</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-zinc-300">
            Are you sure you want to withdraw the app review request from{" "}
            <span className="font-bold text-zinc-100">@{request.username}</span>?
          </p>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
            <p>
              Requested {formatDate(request.createdAt)} · {formatRelativeAge(request.createdAt)}
            </p>
            <p className="mt-1">
              {formatAmount(request.amount)} total · user {formatAmount(request.workerAmount)}
            </p>
          </div>

          <p className="text-xs leading-5 text-zinc-500">
            This removes the pending request from the user. If the request was client-funded, the held amount will be
            returned according to the existing review-withdrawal rules.
          </p>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {(error as Error & { response?: { data?: { error?: string } } })?.response?.data?.error || error.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/30 disabled:opacity-50"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {isPending ? "Withdrawing..." : "Yes, withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
