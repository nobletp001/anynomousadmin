import React from "react";
import { Link as LinkIcon, ExternalLink, Eye, Download, ScanSearch } from "lucide-react";
import { Submission } from "../types";
import { getImagesList, getDownloadUrl } from "../utils";
import {
  imageComparisonDecisionLabel,
  imageComparisonLabel,
  imageComparisonTone,
  parseImageComparison,
} from "../image-comparison";

interface SubmissionProofPanelProps {
  sub: Submission;
  onZoomImage: (images: string[], index: number) => void;
  onCompareSubmission?: (submissionId: number) => void;
}

export function SubmissionProofPanel({ sub, onZoomImage, onCompareSubmission }: SubmissionProofPanelProps) {
  const images = getImagesList(sub.proof);
  const comparison = parseImageComparison(sub.imageMetadata);

  return (
    <div className="md:col-span-7 space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 h-full flex flex-col min-h-[300px]">
        <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5 mb-4 shrink-0">
          Submitted Proof
        </h4>
        <ImageComparisonCard comparison={comparison} onCompareSubmission={onCompareSubmission} />

        {sub.proofType === "link" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
            <LinkIcon className="w-10 h-10 text-blue-400" />
            <div>
              <p className="font-bold text-sm text-zinc-200">URL Link Proof</p>
              <p className="text-xs text-zinc-550 mt-1 max-w-sm truncate">{sub.proof}</p>
            </div>
            <a
              href={sub.proof}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Open Link in New Tab
            </a>
          </div>
        ) : images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-650 italic">
            No images submitted
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[420px] pr-1">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-2 space-y-3">
                  <div
                    onClick={() => onZoomImage(images, idx)}
                    className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-955 cursor-zoom-in hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={imgUrl}
                      alt={`Screenshot Proof ${idx + 1}`}
                      className="w-full h-full object-contain bg-black pointer-events-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">
                      Screenshot #{idx + 1} of {images.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-850 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Full Size
                      </a>
                      <a
                        href={getDownloadUrl(imgUrl)}
                        download={`proof-${sub.username}-${idx + 1}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-[11px] font-bold text-purple-300 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageComparisonCard({
  comparison,
  onCompareSubmission,
}: {
  comparison: ReturnType<typeof parseImageComparison>;
  onCompareSubmission?: (submissionId: number) => void;
}) {
  const tone = imageComparisonTone(comparison);
  const score = comparison.bestMatchScore ?? 0;
  const details = comparison.details;
  const canCompare = Boolean(comparison.bestMatchSubmission && onCompareSubmission);
  return (
    <div
      className={`mb-4 rounded-xl border p-3 ${
        tone === "danger"
          ? "border-red-500/30 bg-red-500/10"
          : tone === "warning"
            ? "border-amber-500/30 bg-amber-500/10"
            : tone === "pending"
              ? "border-zinc-700 bg-zinc-900/60"
              : "border-emerald-500/20 bg-emerald-500/10"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200">
          <ScanSearch className="h-4 w-4" />
          {imageComparisonLabel(comparison)}
        </span>
        <button
          className={`rounded-full border border-current/20 px-2.5 py-1 text-xs font-black text-zinc-100 transition ${
            canCompare ? "cursor-pointer hover:bg-white/10" : "cursor-default"
          }`}
          disabled={!canCompare}
          onClick={() => {
            if (comparison.bestMatchSubmission) onCompareSubmission?.(comparison.bestMatchSubmission);
          }}
          title={canCompare ? "Compare matched submission side by side" : imageComparisonDecisionLabel(comparison)}
          type="button"
        >
          {score}% match
        </button>
      </div>
      <p className="mt-2 text-[11px] font-black text-zinc-200">{imageComparisonDecisionLabel(comparison)}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold text-zinc-400 sm:grid-cols-4">
        <span>Perceptual {details?.phashSim ?? 0}%</span>
        <span>Raw {details?.rawSim ?? 0}%</span>
        <span>OCR {details?.ocrSim ?? 0}%</span>
        <span>Meta {details?.metaSim ?? 0}%</span>
      </div>
      {comparison.bestMatchUsername ? (
        <p className="mt-2 text-[11px] font-semibold text-zinc-400">
          Best match: @{comparison.bestMatchUsername} · submission #{comparison.bestMatchSubmission} ·{" "}
          {comparison.matchCount ?? 0} flagged of {comparison.checkedCount ?? 0} checked
        </p>
      ) : (
        <p className="mt-2 text-[11px] font-semibold text-zinc-500">
          {comparison.checkedCount ?? 0} image submissions checked for this task.
        </p>
      )}
      {comparison.matches && comparison.matches.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {comparison.matches.map((match) => (
            <button
              className="rounded-lg border border-current/20 bg-black/20 px-2 py-1 text-[10px] font-black text-zinc-100 transition hover:bg-white/10"
              key={match.submissionId}
              onClick={() => onCompareSubmission?.(match.submissionId)}
              type="button"
            >
              @{match.username} · {match.score}%
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
