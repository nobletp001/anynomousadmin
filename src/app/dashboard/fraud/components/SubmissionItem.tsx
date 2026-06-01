import React from "react";
import { ExternalLink } from "lucide-react";
import { formatAmount, formatDate, getImagesList } from "../utils";

interface SubmissionItemProps {
  sub: any;
  onZoom: (img: string, index: number, allImages: string[]) => void;
}

export function SubmissionItem({ sub, onZoom }: SubmissionItemProps) {
  const statusColors: Record<string, string> = {
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    needs_correction: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };
  
  const imgs = sub.proofType === "banner" ? getImagesList(sub.proof) : [];

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-955/20 p-4 shadow-sm space-y-3">
      {/* Sub Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h5 className="text-xs font-bold text-zinc-200">{sub.taskTitle}</h5>
          <p className="text-[10px] text-zinc-550 mt-0.5">
            {formatAmount(sub.taskAmount)} · {formatDate(sub.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusColors[sub.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
          {sub.status}
        </span>
      </div>

      {/* Answers */}
      {(sub.textResponse || sub.numberResponse) && (
        <div className="space-y-1.5 text-[11px] bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900">
          {sub.textResponse && (
            <div>
              <span className="text-zinc-650 block text-[9px] font-bold uppercase">Text Answer</span>
              <span className="text-zinc-300">{sub.textResponse}</span>
            </div>
          )}
          {sub.numberResponse && (
            <div className={sub.textResponse ? "mt-1.5 border-t border-zinc-900 pt-1.5" : ""}>
              <span className="text-zinc-650 block text-[9px] font-bold uppercase">Number Answer</span>
              <span className="text-zinc-300">{sub.numberResponse}</span>
            </div>
          )}
        </div>
      )}

      {/* Proof */}
      <div>
        {sub.proofType === "link" ? (
          <a
            href={sub.proof}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-xs font-bold text-blue-400 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Proof Link
          </a>
        ) : imgs.length === 0 ? (
          <p className="text-[10px] text-zinc-650 italic">No image proof submitted</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {imgs.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => onZoom(img, i, imgs)}
                className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 cursor-zoom-in hover:opacity-90 transition-opacity bg-black"
              >
                <img src={img} alt="Proof" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Metadata */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 border-t border-zinc-850/60 pt-2 flex-wrap gap-1.5">
        <span>IP: {sub.ipAddress || "N/A"}</span>
        <span>Device: {sub.deviceId ? `${sub.deviceId.substring(0, 12)}...` : "N/A"}</span>
      </div>
    </div>
  );
}
