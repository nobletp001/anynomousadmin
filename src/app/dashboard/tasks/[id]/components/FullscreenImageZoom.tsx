import React from "react";
import { X, ChevronLeft, ChevronRight, Eye, Download } from "lucide-react";
import { getDownloadUrl } from "../utils";

interface FullscreenImageZoomProps {
  activeIndex: number;
  imagesList: string[];
  username?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function FullscreenImageZoom({
  activeIndex,
  imagesList,
  username,
  onClose,
  onPrev,
  onNext,
}: FullscreenImageZoomProps) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-6 right-6 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200">
        <X className="w-6 h-6" />
      </button>
      <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center">
        {imagesList.length > 1 && (
          <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <img src={imagesList[activeIndex]} alt="Fullscreen Proof" className="max-w-full max-h-full object-contain rounded-lg border border-zinc-950 shadow-2xl" />
        {imagesList.length > 1 && (
          <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-zinc-400 text-xs font-bold uppercase">Screenshot {activeIndex + 1} of {imagesList.length}</span>
        <div className="flex gap-2">
          <a href={imagesList[activeIndex]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white">
            <Eye className="w-4 h-4" />View Full
          </a>
          <a href={getDownloadUrl(imagesList[activeIndex])} download={`proof-${username || "user"}-${activeIndex + 1}.jpg`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Download className="w-4 h-4" />Download
          </a>
        </div>
      </div>
    </div>
  );
}
