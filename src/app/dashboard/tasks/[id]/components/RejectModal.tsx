import React, { useState, useEffect } from "react";
import { Move, Coins } from "lucide-react";
import { Button } from "@/components/ui";
import { RejectModal as RejectModalType } from "../types";
import { formatAmount } from "../utils";

interface RejectModalProps {
  rejectModal: RejectModalType;
  deductAmount: string;
  setDeductAmount: (v: string) => void;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  onClose: () => void;
  onSubmitReject: () => void;
  onSubmitCorrection: () => void;
  isPending: boolean;
  error: any;
}

export function RejectModal({
  rejectModal,
  deductAmount,
  setDeductAmount,
  rejectReason,
  setRejectReason,
  onClose,
  onSubmitReject,
  onSubmitCorrection,
  isPending,
  error,
}: RejectModalProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: 0, y: 0 });
  }, [rejectModal]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("textarea")) return;
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

  const isRejectMode = rejectModal.mode === "reject";
  const tags = [
    "Screenshot is blurry/unreadable",
    "Wrong account/handle shown",
    isRejectMode
      ? "No proof of follow/comment action"
      : "Please upload a full screenshot showing follow action",
    "Already completed this task",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-md relative select-none"
      >
        <div
          onMouseDown={handleMouseDown}
          className="p-6 border-b border-zinc-800 cursor-move select-none flex items-center justify-between"
        >
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>{isRejectMode ? "Reject Submission" : "Request Correction"}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-550 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 font-normal select-none">
                <Move className="w-2.5 h-2.5" /> Drag
              </span>
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">@{rejectModal.username}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isRejectMode && (
            <>
              <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div>
                  <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">Current Balance</p>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatAmount(rejectModal.balance)}</p>
                </div>
                <Coins className="w-8 h-8 text-emerald-500/30" />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  Deduct from balance <span className="text-zinc-650 font-normal">(optional, ₦)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={rejectModal.balance}
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Quick tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setRejectReason(tag)}
                  className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] transition-colors border border-zinc-700/60"
                >
                  {tag.split(" ")[0]}... {tag.split(" ").slice(-2).join(" ")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              {isRejectMode ? "Rejection reason" : "Correction instructions"} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={isRejectMode ? "Explain why this submission is being rejected..." : "Explain what the user needs to correct..."}
              rows={3}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error?.response?.data?.error ?? "Action failed"}</p>}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
          <Button variant="outline" size="md" onClick={onClose} disabled={isPending}>Cancel</Button>
          {isRejectMode ? (
            <Button variant="danger" size="md" onClick={onSubmitReject} isLoading={isPending} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          ) : (
            <button
              type="button"
              onClick={onSubmitCorrection}
              disabled={!rejectReason.trim() || isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Sending..." : "Send Correction Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
