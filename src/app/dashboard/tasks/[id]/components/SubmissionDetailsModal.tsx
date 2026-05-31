import React, { useState, useEffect } from "react";
import { FileText, Move, Users, X, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui";
import { Submission, Task } from "../types";
import { formatDate } from "../utils";
import { SubmissionUserInfoPanel } from "./SubmissionUserInfoPanel";
import { SubmissionProofPanel } from "./SubmissionProofPanel";

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
}: SubmissionDetailsModalProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: 0, y: 0 });
  }, [sub]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("a")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
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

  const isPending = sub.status === "pending" || sub.status === "needs_correction";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20 cursor-move select-none shrink-0"
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
              Submitted by <span className="font-bold text-white">@{sub.username}</span> ({sub.user?.name || "No Name"}) · {formatDate(sub.createdAt)}
              {task.assignedOfficer && (
                <>
                  {" · "}
                  <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-955/40 border border-purple-900/30 rounded-full px-2 py-0.5 font-semibold">
                    <Users className="w-3 h-3" />
                    Auditor: @{task.assignedOfficer}
                  </span>
                </>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
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
          />
          <SubmissionProofPanel sub={sub} onZoomImage={onZoomImage} />
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/20 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Close Details
              <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono uppercase">Esc</kbd>
            </Button>
            {onWatchUser && (
              <button
                onClick={() => onWatchUser(sub.username)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                title={`Place @${sub.username} under fraud watch`}
              >
                <Eye className="w-3.5 h-3.5" />
                Track User
              </button>
            )}
          </div>
          {isPending && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onCorrectionClick}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Request Correction
                <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-mono uppercase">C</kbd>
              </button>
              <button
                onClick={onRejectClick}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Submission
                <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-300 rounded border border-red-500/30 font-mono uppercase">R</kbd>
              </button>
              <button
                onClick={onApprove}
                disabled={isApprovePending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve Proof
                <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-zinc-950/15 text-zinc-900 rounded border border-zinc-950/10 font-mono uppercase">A</kbd>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
