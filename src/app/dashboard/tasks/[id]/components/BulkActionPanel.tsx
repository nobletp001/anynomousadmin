import React from "react";

interface BulkActionPanelProps {
  selectedCount: number;
  bulkMode: "none" | "approve" | "reject";
  setBulkMode: (mode: "none" | "approve" | "reject") => void;
  bulkRating: number | null;
  setBulkRating: (r: number | null) => void;
  bulkRejectReason: string;
  setBulkRejectReason: (r: string) => void;
  onClearSelection: () => void;
  onConfirmApprove: () => void;
  onConfirmReject: () => void;
  isPending: boolean;
}

export function BulkActionPanel({
  selectedCount,
  bulkMode,
  setBulkMode,
  bulkRating,
  setBulkRating,
  bulkRejectReason,
  setBulkRejectReason,
  onClearSelection,
  onConfirmApprove,
  onConfirmReject,
  isPending,
}: BulkActionPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-sm font-bold text-zinc-200 shrink-0">{selectedCount} selected</span>

        {bulkMode === "none" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setBulkMode("approve")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => setBulkMode("reject")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Bulk Reject
            </button>
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}

        {bulkMode === "approve" && (
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setBulkRating(star)}
                  className={`text-xl transition-all ${
                    bulkRating !== null && star <= bulkRating
                      ? "text-amber-400 scale-110"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  ★
                </button>
              ))}
              {bulkRating !== null && <span className="text-xs text-zinc-400 font-mono">({bulkRating}.0)</span>}
            </div>
            <button
              onClick={onConfirmApprove}
              disabled={bulkRating === null || isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-zinc-955 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Approving..." : "Confirm Approve"}
            </button>
            <button
              onClick={() => {
                setBulkMode("none");
                setBulkRating(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {bulkMode === "reject" && (
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Rejection reason for all selected..."
              rows={2}
              className="flex-1 min-w-48 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none"
            />
            <button
              onClick={onConfirmReject}
              disabled={!bulkRejectReason.trim() || isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Rejecting..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => {
                setBulkMode("none");
                setBulkRejectReason("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
