import React, { useState, useEffect } from "react";
import { FileText, Move, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { Submission, Task } from "../types";
import { formatDate } from "../utils";
import { SubmissionUserInfoPanel } from "./SubmissionUserInfoPanel";
import { SubmissionProofPanel } from "./SubmissionProofPanel";
import { SideBySideCompareBody } from "./SideBySideCompareBody";
import { apiClient } from "@/services/api-client";
import { isActionableSubmissionStatus } from "../utils";

interface SubmissionDetailsModalProps {
  sub: Submission;
  submissions: Submission[];
  task: Task;
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
  onZoomImage: (images: string[], index: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onCorrectionClick: () => void;
  onRejectClick: () => void;
  isApprovePending: boolean;
  onWatchUser?: (username: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function SubmissionDetailsModal({
  sub,
  submissions,
  task,
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
  onZoomImage,
  onClose,
  onApprove,
  onCorrectionClick,
  onRejectClick,
  isApprovePending,
  onWatchUser,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: SubmissionDetailsModalProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Comparison state
  const [comparisonSub, setComparisonSub] = useState<Submission | null>(null);

  useEffect(() => {
    setPos({ x: 0, y: 0 });
    setComparisonSub(null);
  }, [sub]);

  // Log fraud alert automatically when compared
  useEffect(() => {
    if (comparisonSub) {
      apiClient.post(`/admin/fraud/analyze/${sub.username}`).catch(console.error);
      apiClient.post(`/admin/fraud/analyze/${comparisonSub.username}`).catch(console.error);
      apiClient
        .patch(`/admin/fraud/users/${sub.username}/monitor`, { monitored: true, runAnalysis: true })
        .catch(console.error);
      apiClient
        .patch(`/admin/fraud/users/${comparisonSub.username}/monitor`, { monitored: true, runAnalysis: true })
        .catch(console.error);
    }
  }, [comparisonSub, sub.username]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("a"))
      return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleCompareUser = (username: string) => {
    const match = submissions.find((s) => s.username === username);
    if (match) {
      setComparisonSub(match);
    } else {
      alert(
        `User @${username} has not submitted this task, but is flagged for collision details. We've logged this collision context in Fraud.`
      );
      apiClient.post(`/admin/fraud/analyze/${sub.username}`).catch(console.error);
      apiClient.post(`/admin/fraud/analyze/${username}`).catch(console.error);
    }
  };

  const handleApproveClick = () => {
    onApprove();
  };

  const canAction = isActionableSubmissionStatus(sub.status);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-955/20 cursor-move select-none shrink-0"
        >
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Submission Details</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-550 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 font-normal select-none">
                <Move className="w-2.5 h-2.5" /> Drag
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Submitted by <span className="font-bold text-white">@{sub.username}</span> · {formatDate(sub.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(onPrev || onNext) && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onPrev}
                  disabled={!onPrev}
                  title="Previous submission (←)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {totalCount !== undefined && currentIndex !== undefined && (
                  <span className="text-xs text-zinc-500 tabular-nums min-w-12 text-center">
                    {currentIndex + 1} / {totalCount}
                  </span>
                )}
                <button
                  onClick={onNext}
                  disabled={!onNext}
                  title="Next submission (→)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {comparisonSub ? (
            <SideBySideCompareBody
              sub={sub}
              comparisonSub={comparisonSub}
              task={task}
              onZoomImage={onZoomImage}
              onWatchUser={onWatchUser}
              onCloseCompare={() => setComparisonSub(null)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <SubmissionUserInfoPanel
                sub={sub}
                submissions={submissions}
                taskAmount={task.amount}
                rating={rating}
                setRating={setRating}
                feedback={feedback}
                setFeedback={setFeedback}
                showReportForm={showReportForm}
                setShowReportForm={setShowReportForm}
                reportDeductAmount={reportDeductAmount}
                setReportDeductAmount={setReportDeductAmount}
                reportReason={reportReason}
                setReportReason={setReportReason}
                onSubmitReport={onSubmitReport}
                isReportPending={isReportPending}
                onCompareUser={handleCompareUser}
              />
              <SubmissionProofPanel sub={sub} onZoomImage={onZoomImage} />
            </div>
          )}
        </div>

        {/* Modal Actions Footer (Only visible in single view mode to keep UI clean) */}
        {!comparisonSub && (
          <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-955/20 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="md" onClick={onClose}>
                Close Details
              </Button>
              {onWatchUser && (
                <button
                  onClick={() => onWatchUser(sub.username)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Track User
                </button>
              )}
            </div>
            {canAction && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onCorrectionClick}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  Request Correction
                </button>
                <button
                  onClick={onRejectClick}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer"
                >
                  Reject Submission
                </button>
                <button
                  onClick={handleApproveClick}
                  disabled={isApprovePending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Approve Proof
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
