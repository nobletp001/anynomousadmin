import React from "react";
import { Submission } from "../types";
import { SubmissionUserDetailsCard } from "./SubmissionUserDetailsCard";
import { ViolationReportForm } from "./ViolationReportForm";
import { formatAmount, isActionableSubmissionStatus } from "../utils";

interface SubmissionUserInfoPanelProps {
  sub: Submission;
  submissions: Submission[];
  taskAmount: number;
  rating: number | null;
  setRating: (rating: number | null) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  showReportForm: boolean;
  setShowReportForm: (show: boolean) => void;
  reportDeductAmount: string;
  setReportDeductAmount: (val: string) => void;
  reportReason: string;
  setReportReason: (val: string) => void;
  onSubmitReport: () => void;
  isReportPending: boolean;
  onCompareUser?: (username: string) => void;
}

export function SubmissionUserInfoPanel({
  sub,
  submissions,
  taskAmount,
  rating,
  setRating,
  feedback,
  setFeedback,
  showReportForm,
  setShowReportForm,
  reportDeductAmount,
  setReportDeductAmount,
  reportReason,
  setReportReason,
  onSubmitReport,
  isReportPending,
  onCompareUser,
}: SubmissionUserInfoPanelProps) {
  const canAction = isActionableSubmissionStatus(sub.status);

  return (
    <div className="md:col-span-5 space-y-5">
      <SubmissionUserDetailsCard sub={sub} submissions={submissions} onCompareUser={onCompareUser} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
        <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
          Collected Input Responses
        </h4>
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Collected Text Details</p>
          {sub.textResponse ? (
            <div className="flex items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              {/^(https?:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,}/i.test(sub.textResponse.trim()) ? (
                <a
                  href={
                    sub.textResponse.trim().startsWith("http")
                      ? sub.textResponse.trim()
                      : `https://${sub.textResponse.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex-1 break-all font-medium select-all flex items-center justify-between gap-1.5"
                >
                  <span>{sub.textResponse}</span>
                  <svg
                    className="w-3.5 h-3.5 shrink-0 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ) : (
                <p className="text-xs text-zinc-200 flex-1 break-all font-medium select-all">{sub.textResponse}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-650 italic">No text details collected</p>
          )}
        </div>
        <div className="space-y-1.5 pt-3 border-t border-zinc-900/60">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Collected Numeric Details</p>
          {sub.numberResponse ? (
            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <p className="text-sm font-bold text-purple-300 select-all">{sub.numberResponse}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-655 italic">No numeric details collected</p>
          )}
        </div>
        {sub.selectedPrompt && (
          <div className="space-y-1.5 pt-3 border-t border-zinc-900/60">
            <p className="text-[10px] text-zinc-555 uppercase font-semibold">Submitted Prompt / Text copied</p>
            <div className="flex items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-200 flex-1 break-all font-medium select-all">{sub.selectedPrompt}</p>
            </div>
          </div>
        )}
        {sub.assignedReview && (
          <div className="space-y-1.5 pt-3 border-t border-zinc-900/60">
            <p className="text-[10px] text-zinc-550 uppercase font-semibold">Assigned Client Request Review to Use</p>
            <div className="flex items-start gap-2 bg-zinc-900 p-2.5 rounded-lg border border-zinc-850 bg-amber-500/5">
              <p className="text-xs text-amber-200 flex-1 break-all font-bold select-all text-center">
                {sub.assignedReview}
              </p>
            </div>
            <p className="text-[10px] text-amber-500/90 font-medium leading-normal flex items-start gap-1 mt-1">
              <span className="text-xs leading-none">⚠️</span>
              <span>Warning: Verify that the user used this exact review text and did not use something else!</span>
            </p>
          </div>
        )}
      </div>

      {canAction && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
            Action Verdict (Required)
          </h4>
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Select Star Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-all ${
                    rating !== null && star <= rating ? "text-amber-400 scale-110" : "text-zinc-700 hover:text-zinc-400"
                  }`}
                >
                  ★
                </button>
              ))}
              {rating !== null && <span className="text-xs text-zinc-400 font-mono ml-1.5">({rating}.0)</span>}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Feedback (Optional)</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback remarks..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-550 focus:outline-none min-h-[60px]"
            />
          </div>
        </div>
      )}

      {sub.status === "approved" && typeof sub.rating === "number" && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 space-y-3">
          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-950 pb-1.5">
            Approved Verdict
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Rating:</span>
            <div className="flex text-amber-400 text-xs">
              {"★".repeat(sub.rating)}
              {"☆".repeat(5 - sub.rating)}
            </div>
          </div>
          {sub.feedback && (
            <p className="text-xs text-zinc-300 italic bg-zinc-955/20 p-2.5 rounded-lg border border-zinc-900/60 font-medium">
              &ldquo;{sub.feedback}&rdquo;
            </p>
          )}

          {!showReportForm ? (
            <button
              type="button"
              onClick={() => setShowReportForm(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Log Violation / Revoke Earning
            </button>
          ) : (
            <ViolationReportForm
              taskAmount={taskAmount}
              reportDeductAmount={reportDeductAmount}
              setReportDeductAmount={setReportDeductAmount}
              reportReason={reportReason}
              setReportReason={setReportReason}
              onSubmit={onSubmitReport}
              onCancel={() => setShowReportForm(false)}
              isPending={isReportPending}
            />
          )}
        </div>
      )}

      {(sub.status === "rejected" || sub.status === "needs_correction") && sub.rejectionReason && (
        <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-4 space-y-2">
          <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            {sub.status === "rejected" ? "Rejection Reason" : "Correction Instructions"}
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{sub.rejectionReason}</p>
          {sub.status === "rejected" && sub.deductedAmount > 0 && (
            <p className="text-[10px] text-red-400 font-semibold mt-1">Deducted: -{formatAmount(sub.deductedAmount)}</p>
          )}
        </div>
      )}
    </div>
  );
}
