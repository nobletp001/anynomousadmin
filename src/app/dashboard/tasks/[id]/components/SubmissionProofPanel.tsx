import React from "react";
import { Link as LinkIcon, ExternalLink, Eye, Download } from "lucide-react";
import { Submission } from "../types";
import { getImagesList, getDownloadUrl } from "../utils";

interface SubmissionProofPanelProps {
  sub: Submission;
  onZoomImage: (images: string[], index: number) => void;
}

export function SubmissionProofPanel({ sub, onZoomImage }: SubmissionProofPanelProps) {
  const images = getImagesList(sub.proof);

  return (
    <div className="md:col-span-7 space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 h-full flex flex-col min-h-[300px]">
        <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5 mb-4 shrink-0">
          Submitted Proof
        </h4>

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
