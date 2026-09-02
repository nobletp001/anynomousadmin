import React from "react";
import { CheckCircle, X } from "lucide-react";

import { Button } from "@/components/ui";
import { Submission } from "../types";

interface AppReviewRequestModalProps {
  submission: Submission;
  reviewText: string;
  setReviewText: (value: string) => void;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onConfirm: () => void;
}

export function AppReviewRequestModal({
  submission,
  reviewText,
  setReviewText,
  isPending,
  error,
  onClose,
  onConfirm,
}: AppReviewRequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">App Download Follow-up</p>
            <h3 className="mt-1 text-base font-bold text-zinc-100">Ask @{submission.username} for app review</h3>
            <p className="mt-1 text-xs text-zinc-500">User reward after proof approval: ₦100</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Close app review request modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs text-blue-200">
            This creates a follow-up review request on the approved app-download submission. The user will see the
            instruction on their task card and can submit proof again for review.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Review instruction <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={5}
              placeholder="Tell the user exactly what to review and what proof to upload..."
              className="w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-sm font-medium text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
            />
          </div>

          {error ? (
            <p className="text-xs text-red-400">
              {error instanceof Error ? error.message : "Failed to request app review."}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
          <Button variant="outline" size="md" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm} isLoading={isPending} disabled={!reviewText.trim()}>
            <CheckCircle className="h-4 w-4" />
            Send Review Request
          </Button>
        </div>
      </div>
    </div>
  );
}
