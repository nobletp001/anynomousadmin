import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { ImageEntry } from "../types";

const MAX_IMAGES = 5;

interface TaskDetailsFormProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  caption: string;
  setCaption: (v: string) => void;
  link: string;
  setLink: (v: string) => void;
  images: ImageEntry[];
  setImages: React.Dispatch<React.SetStateAction<ImageEntry[]>>;
  uploadError: string;
  setUploadError: (v: string) => void;
}

export function TaskDetailsForm({
  title,
  setTitle,
  description,
  setDescription,
  caption,
  setCaption,
  link,
  setLink,
  images,
  setImages,
  uploadError,
  setUploadError,
}: TaskDetailsFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
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
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setUploadError("");
  };

  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 pb-2 border-b border-zinc-800">Task Details</h2>
      <div>
        <FieldLabel required>Title</FieldLabel>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Post Kena promo on your WhatsApp Status"
          className={inputCls}
        />
      </div>
      <div>
        <FieldLabel required>Description</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief overview of what the task is about..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div>
        <FieldLabel>
          Caption <span className="text-zinc-650 font-normal">(optional — plain text shown to users)</span>
        </FieldLabel>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add optional caption text to show with the task..."
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div>
        <FieldLabel>
          Link <span className="text-zinc-650 font-normal">(optional — profile, post, or page to act on)</span>
        </FieldLabel>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
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
          {images.length > 0 && (
            <span className="text-[11px] text-zinc-550">
              {images.length} / {MAX_IMAGES}
            </span>
          )}
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-zinc-700/60 group aspect-video"
              >
                <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-zinc-300 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < MAX_IMAGES && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-800/30 cursor-pointer hover:border-purple-500/40 hover:bg-zinc-800/50 transition-colors"
          >
            <Upload className="w-5 h-5 text-zinc-500" />
            <p className="text-xs text-zinc-500 font-medium">Click or drag to add images</p>
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
        {uploadError && <p className="text-xs text-red-450 mt-1">{uploadError}</p>}
      </div>
    </div>
  );
}
