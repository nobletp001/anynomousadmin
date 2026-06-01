import React, { useState } from "react";
import { AlertCircle, Eye, CheckCircle, XCircle, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Submission, Task } from "../types";
import { formatAmount, formatDate, getImagesList } from "../utils";
import { useQueryClient } from "@tanstack/react-query";

interface SideBySideCompareBodyProps {
  sub: Submission;
  comparisonSub: Submission;
  task: Task;
  onZoomImage: (images: string[], index: number) => void;
  onWatchUser?: (username: string) => void;
  onCloseCompare: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function SideBySideCompareBody({
  sub,
  comparisonSub,
  task,
  onZoomImage,
  onWatchUser,
  onCloseCompare,
}: SideBySideCompareBodyProps) {
  const queryClient = useQueryClient();
  const [actionsPending, setActionsPending] = useState<Record<number, boolean>>({});
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});

  const handleAction = async (subId: number, action: "approve" | "reject" | "needs_correction") => {
    setActionsPending((prev) => ({ ...prev, [subId]: true }));
    try {
      const token = localStorage.getItem("admin_token");
      const body: any = { action };
      if (action === "approve") {
        body.rating = 5;
        body.feedback = "Approved side-by-side comparison";
      } else {
        body.rejectionReason = action === "reject" ? "Duplicate/fake proof submission" : "Please submit correct proof";
        body.deductedAmount = 0;
      }

      const res = await fetch(`${API_BASE}/api/admin/tasks/${task.id}/submissions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setLocalStatuses((prev) => ({ ...prev, [subId]: action }));
        queryClient.invalidateQueries({ queryKey: ["task-submissions", String(task.id)] });
      } else {
        alert("Action failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error actioning submission.");
    } finally {
      setActionsPending((prev) => ({ ...prev, [subId]: false }));
    }
  };

  const renderColumn = (s: Submission, title: string) => {
    const status = localStatuses[s.id] || s.status;
    const isPending = status === "pending" || status === "needs_correction";
    const imgs = s.proofType === "banner" ? getImagesList(s.proof) : [];

    return (
      <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 space-y-4 flex flex-col h-full">
        <h4 className="text-xs font-bold text-violet-400 border-b border-zinc-850 pb-2 flex items-center justify-between">
          <span>{title} (@{s.username})</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase select-none ${status === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : status === "rejected" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
            {status}
          </span>
        </h4>

        {/* User Card info */}
        <div className="text-xs space-y-1.5 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
          <p><span className="text-zinc-500 font-medium">Name:</span> <span className="font-semibold text-zinc-200">{s.user?.name || "—"}</span></p>
          <p><span className="text-zinc-500 font-medium">Balance:</span> <span className="font-semibold text-emerald-400">{formatAmount(s.userBalance)}</span></p>
          {s.user && (s.user as any).accountNumber && (
            <p className="font-mono mt-1 border-t border-zinc-850 pt-1.5"><span className="text-zinc-500">Bank Acc:</span> {(s.user as any).accountNumber} ({(s.user as any).bankName})</p>
          )}
        </div>

        {/* Earning verdict action buttons */}
        {isPending && (
          <div className="space-y-2 bg-zinc-900/20 p-3.5 rounded-lg border border-zinc-850/60">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Verdict Action</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={actionsPending[s.id]}
                onClick={() => handleAction(s.id, "approve")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-bold transition disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                disabled={actionsPending[s.id]}
                onClick={() => handleAction(s.id, "needs_correction")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600/20 text-amber-400 text-[10px] font-bold transition disabled:opacity-40 cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" /> Correction
              </button>
              <button
                disabled={actionsPending[s.id]}
                onClick={() => handleAction(s.id, "reject")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 text-[10px] font-bold transition disabled:opacity-40 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        )}

        {/* Answers details */}
        {(s.textResponse || s.numberResponse) && (
          <div className="text-[11px] bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 space-y-2">
            {s.textResponse && <p><span className="text-zinc-600 font-bold block text-[9px] uppercase">Text Answer:</span> {s.textResponse}</p>}
            {s.numberResponse && <p><span className="text-zinc-600 font-bold block text-[9px] uppercase">Number Answer:</span> {s.numberResponse}</p>}
          </div>
        )}

        {/* Proof display */}
        <div className="flex-1 flex flex-col justify-end">
          {s.proofType === "link" ? (
            <a
              href={s.proof}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-xs font-bold text-blue-400 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Proof Link
            </a>
          ) : imgs.length === 0 ? (
            <p className="text-xs text-zinc-650 italic py-4 text-center">No image submitted</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {imgs.map((imgUrl, idx) => (
                <div key={idx} onClick={() => onZoomImage(imgs, idx)} className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-850 cursor-zoom-in hover:opacity-90 bg-black">
                  <img src={imgUrl} alt="Proof" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-zinc-950/30 p-3 rounded-xl border border-zinc-850 text-xs">
        <span className="text-zinc-400">Comparing submissions side-by-side</span>
        <button onClick={onCloseCompare} className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer font-bold">
          Exit Side-by-Side
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {renderColumn(sub, "Main Account")}
        {renderColumn(comparisonSub, "Colliding Account")}
      </div>
    </div>
  );
}
