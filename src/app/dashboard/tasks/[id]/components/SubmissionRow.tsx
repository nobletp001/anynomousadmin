import React from "react";
import { Badge } from "@/components/ui";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  Undo2,
} from "lucide-react";
import { BusinessReviewRequest, Submission } from "../types";
import {
  formatAmount,
  formatDate,
  formatRelativeAge,
  statusVariant,
  isActionableSubmissionStatus,
  formatSubmissionStatus,
  getDuplicateWarning,
  getIpWarning,
  getDeviceWarning,
  getImagesList,
} from "../utils";

interface SubmissionRowProps {
  sub: Submission;
  submissions: Submission[];
  selectedIds: Set<number>;
  onSelect: (subId: number) => void;
  isViewing: boolean;
  onReview: () => void;
  onCorrection: () => void;
  onReject: () => void;
  onReverseReject?: () => void;
  onRemove: () => void;
  appReviewRequest?: BusinessReviewRequest | null;
  canRequestAppReview?: boolean;
  onRequestAppReview?: () => void;
  onWithdrawAppReview?: (request: BusinessReviewRequest) => void;
  isWithdrawingAppReview?: boolean;
  isAppTestingTask?: boolean;
  onQualifyAppTesting?: () => void;
  onFinalizeAppTesting?: () => void;
}

export function SubmissionRow({
  sub,
  submissions,
  selectedIds,
  onSelect,
  isViewing,
  onReview,
  onCorrection,
  onReject,
  onReverseReject,
  onRemove,
  appReviewRequest,
  canRequestAppReview = false,
  onRequestAppReview,
  onWithdrawAppReview,
  isWithdrawingAppReview = false,
  isAppTestingTask = false,
  onQualifyAppTesting,
  onFinalizeAppTesting,
}: SubmissionRowProps) {
  const isSelectable = isActionableSubmissionStatus(sub.status);

  return (
    <tr
      onClick={onReview}
      className={`hover:bg-zinc-800/20 transition-colors cursor-pointer ${
        isViewing ? "bg-purple-500/10 border-l-2 border-l-purple-500" : selectedIds.has(sub.id) ? "bg-purple-500/5" : ""
      }`}
    >
      <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
        {isSelectable ? (
          <input
            type="checkbox"
            checked={selectedIds.has(sub.id)}
            onChange={() => onSelect(sub.id)}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-purple-500 cursor-pointer"
          />
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
            {(sub.user?.name ?? sub.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-zinc-100 text-xs">{sub.user?.name ?? "—"}</p>
            <p className="text-zinc-550 text-[11px]">@{sub.username}</p>

            <div className="flex flex-col gap-1 mt-1">
              {getDuplicateWarning(sub, submissions) && (
                <span className="inline-flex items-center gap-1 text-[9px] text-red-400 bg-red-955/20 border border-red-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                  Duplicate Proof
                </span>
              )}
              {getIpWarning(sub, submissions) && (
                <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                  Same IP
                </span>
              )}
              {getDeviceWarning(sub, submissions) && (
                <span className="inline-flex items-center gap-1 text-[9px] text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded px-1.5 py-0.5 w-fit font-semibold uppercase tracking-wider">
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                  Same Device
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-semibold text-emerald-400">{formatAmount(sub.userBalance)}</td>
      <td className="px-6 py-4">
        <div className="space-y-1.5 py-1">
          {sub.proofType === "link" ? (
            <a
              href={sub.proof}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-blue-450 hover:text-blue-400 text-xs font-bold transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              View URL Link
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-455 hover:text-amber-400 text-xs font-bold transition-colors">
              <ImageIcon className="w-3.5 h-3.5" />
              Screenshots ({getImagesList(sub.proof).length})
            </span>
          )}

          <div className="flex flex-wrap gap-1.5 mt-1">
            {sub.textResponse &&
              (/^(https?:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,}/i.test(sub.textResponse.trim()) ? (
                <a
                  href={
                    sub.textResponse.trim().startsWith("http")
                      ? sub.textResponse.trim()
                      : `https://${sub.textResponse.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 max-w-44 truncate text-[10px] text-blue-400 hover:text-blue-300 bg-blue-950/20 border border-blue-900/30 rounded px-2 py-0.5 font-medium transition-colors"
                  title={sub.textResponse}
                >
                  <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                  {sub.textResponse}
                </a>
              ) : (
                <span
                  className="inline-block max-w-44 truncate text-[10px] text-zinc-305 bg-zinc-900 border border-zinc-800/80 rounded px-2 py-0.5 font-medium"
                  title={sub.textResponse}
                >
                  Text: {sub.textResponse}
                </span>
              ))}
            {sub.numberResponse && (
              <span
                className="inline-block max-w-44 truncate text-[10px] text-purple-300 bg-purple-955/20 border border-purple-900/30 rounded px-2 py-0.5 font-medium"
                title={sub.numberResponse}
              >
                Num: {sub.numberResponse}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <Badge variant={statusVariant(sub.status)} dot>
            {formatSubmissionStatus(sub.status)}
          </Badge>
          {(sub.status === "rejected" || sub.status === "needs_correction") && sub.rejectionReason && (
            <p className="text-[10px] text-zinc-550 mt-0.5 max-w-44 truncate font-medium" title={sub.rejectionReason}>
              Reason: {sub.rejectionReason}
            </p>
          )}
          {sub.status === "rejected" && sub.deductedAmount > 0 && (
            <p className="text-[10px] text-red-400 mt-0.5">−{formatAmount(sub.deductedAmount)}</p>
          )}
          {appReviewRequest && (
            <div className="mt-1 space-y-0.5">
              <p className="text-[10px] text-blue-300">
                App review: {appReviewRequest.status} · {appReviewRequest.sourceType}
              </p>
              <p className="text-[10px] text-zinc-500">Requested {formatDate(appReviewRequest.createdAt)}</p>
              <p className="text-[10px] font-semibold text-zinc-400">{formatRelativeAge(appReviewRequest.createdAt)}</p>
            </div>
          )}
          {isAppTestingTask && (sub.status === "qualified" || sub.status === "testing_joined") && (
            <p className="mt-1 text-[10px] font-semibold text-sky-300">
              {sub.appTestingJoinedLink || sub.status === "testing_joined"
                ? "User joined testing link"
                : "Qualified for testing"}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(sub.createdAt)}</td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {isSelectable && isAppTestingTask ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onQualifyAppTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve portfolio
            </button>
            <button
              onClick={onCorrection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Correction
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject portfolio
            </button>
          </div>
        ) : isSelectable ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onReview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Review
            </button>
            <button
              onClick={onCorrection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Correction
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        ) : null}
        {sub.status === "rejected" && onReverseReject && (
          <button
            onClick={onReverseReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reverse
          </button>
        )}
        {sub.status !== "removed" && (
          <button
            onClick={onRemove}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isAppTestingTask && (sub.status === "qualified" || sub.status === "testing_joined")
              ? "Remove approved portfolio"
              : "Remove"}
          </button>
        )}
        {canRequestAppReview && !appReviewRequest && (
          <button
            onClick={onRequestAppReview}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Ask review
          </button>
        )}
        {appReviewRequest?.status === "requested" && onWithdrawAppReview && (
          <button
            type="button"
            disabled={isWithdrawingAppReview}
            onClick={() => onWithdrawAppReview(appReviewRequest)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30 transition-colors disabled:opacity-50"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Withdraw review
          </button>
        )}
        {isAppTestingTask && (sub.status === "qualified" || sub.status === "testing_joined") && (
          <button
            onClick={onFinalizeAppTesting}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Final reward
          </button>
        )}
      </td>
    </tr>
  );
}
