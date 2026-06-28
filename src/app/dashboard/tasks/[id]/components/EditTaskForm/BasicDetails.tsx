import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { MAX_IMAGES } from "../../types";

const inputCls =
  "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

interface BasicDetailsProps {
  editCaption: string;
  setEditCaption: (v: string) => void;
  editLink: string;
  setEditLink: (v: string) => void;
  editImages: Array<{ url?: string; file?: File; preview?: string }>;
  setEditImages: React.Dispatch<React.SetStateAction<Array<{ url?: string; file?: File; preview?: string }>>>;
  uploadError: string;
  setUploadError: (v: string) => void;
}

export function BasicDetails({
  editCaption,
  setEditCaption,
  editLink,
  setEditLink,
  editImages,
  setEditImages,
  uploadError,
  setUploadError,
}: BasicDetailsProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - editImages.length;
    if (remaining <= 0) return;
    setUploadError("");

    const toAdd = arr.slice(0, remaining);
    const oversized = toAdd.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setUploadError("Each image must be under 10 MB.");
      return;
    }

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImages((prev) => [...prev, { file, preview: ev.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== idx));
    setUploadError("");
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800/60">Task Details</h2>
      <div>
        <FieldLabel>
          Caption <span className="text-zinc-605 font-normal">(optional — text users copy and post)</span>
        </FieldLabel>
        <textarea
          value={editCaption}
          onChange={(e) => setEditCaption(e.target.value)}
          placeholder="Paste the exact caption users should copy to their post or status..."
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <FieldLabel>
          Link <span className="text-zinc-600 font-normal">(optional — profile, post, or page to act on)</span>
        </FieldLabel>
        <input
          value={editLink}
          onChange={(e) => setEditLink(e.target.value)}
          placeholder="https://..."
          type="url"
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>
            Images <span className="text-zinc-650 font-normal">(optional — up to {MAX_IMAGES})</span>
          </FieldLabel>
          {editImages.length > 0 && (
            <span className="text-[11px] text-zinc-500">
              {editImages.length} / {MAX_IMAGES}
            </span>
          )}
        </div>

        {editImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {editImages.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-zinc-700/60 group aspect-video"
              >
                <img src={img.url || img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-zinc-305 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {editImages.length < MAX_IMAGES && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/30 cursor-pointer hover:border-purple-500/40 hover:bg-zinc-800/50 transition-colors"
          >
            <Upload className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-550 font-medium">Click or drag to add images</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
      </div>
    </div>
  );
}
