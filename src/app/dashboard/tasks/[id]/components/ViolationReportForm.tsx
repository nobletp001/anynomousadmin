import React from "react";

interface ViolationReportFormProps {
  taskAmount: number;
  reportDeductAmount: string;
  setReportDeductAmount: (v: string) => void;
  reportReason: string;
  setReportReason: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ViolationReportForm({
  taskAmount,
  reportDeductAmount,
  setReportDeductAmount,
  reportReason,
  setReportReason,
  onSubmit,
  onCancel,
  isPending,
}: ViolationReportFormProps) {
  return (
    <div className="mt-3 border-t border-zinc-800/80 pt-3 space-y-3">
      <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
        Revocation &amp; Violation Report
      </h5>
      <div className="space-y-1.5">
        <label className="text-[10px] text-zinc-500 uppercase font-semibold">
          Penalty / Deduction Amount (₦)
        </label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 200 (optional)"
          value={reportDeductAmount}
          onChange={(e) => setReportDeductAmount(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-red-500/50"
        />
        <p className="text-[9px] text-zinc-500">
          The approved task reward (₦{taskAmount}) will be revoked automatically. Enter
          any additional penalty here.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] text-zinc-500 uppercase font-semibold">
          Violation Reason / Admin Review (Required)
        </label>
        <textarea
          placeholder="Explain the violation details..."
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 text-xs focus:outline-none focus:border-red-500/50 min-h-[60px]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!reportReason.trim() || isPending}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition-colors"
        >
          {isPending ? "Submitting..." : "Confirm & Submit Report"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
