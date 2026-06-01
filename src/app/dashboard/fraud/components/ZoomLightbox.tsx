import React from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getDownloadUrl } from "../utils";

interface ZoomLightboxProps {
  selectedImage: { imageUrl: string; index: number; allImages: string[] };
  onClose: () => void;
  onChangeImage: (index: number) => void;
}

export function ZoomLightbox({ selectedImage, onClose, onChangeImage }: ZoomLightboxProps) {
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIdx = (selectedImage.index - 1 + selectedImage.allImages.length) % selectedImage.allImages.length;
    onChangeImage(newIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIdx = (selectedImage.index + 1) % selectedImage.allImages.length;
    onChangeImage(newIdx);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full">
          Screenshot {selectedImage.index + 1} of {selectedImage.allImages.length}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={getDownloadUrl(selectedImage.imageUrl)}
            download="proof-screenshot.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="w-full flex-1 flex items-center justify-center relative select-none">
        {selectedImage.allImages.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all border border-zinc-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-[85vw] max-h-[80vh] flex items-center justify-center overflow-hidden">
          <img
            src={selectedImage.imageUrl}
            alt="Proof Zoomed"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-zinc-850"
          />
        </div>

        {selectedImage.allImages.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all border border-zinc-800"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
