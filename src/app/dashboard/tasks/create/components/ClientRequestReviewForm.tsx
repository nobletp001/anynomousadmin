import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface ClientRequestReviewFormProps {
  hasClientRequestReview: boolean;
  setHasClientRequestReview: (v: boolean) => void;
  clientRequestReviews: string[];
  setClientRequestReviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ClientRequestReviewForm({
  hasClientRequestReview,
  setHasClientRequestReview,
  clientRequestReviews,
  setClientRequestReviews,
}: ClientRequestReviewFormProps) {
  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">Client Request Review</h2>
          <p className="text-[11px] text-zinc-550 mt-0.5">Attach unique reviews to copy.</p>
        </div>
        <div
          onClick={() => {
            setHasClientRequestReview(!hasClientRequestReview);
            if (!hasClientRequestReview && clientRequestReviews.length === 0) {
              setClientRequestReviews([""]);
            }
          }}
          className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${
            hasClientRequestReview ? "bg-emerald-500" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
              hasClientRequestReview ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {hasClientRequestReview && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 font-medium">Add reviews one by one</p>
            <button
              type="button"
              onClick={() => setClientRequestReviews((prev) => [...prev, ""])}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Review
            </button>
          </div>

          <div className="space-y-2">
            {clientRequestReviews.map((review, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="flex h-6 w-6 mt-2 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                  {idx + 1}
                </span>
                <textarea
                  value={review}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClientRequestReviews((prev) => prev.map((s, i) => (i === idx ? val : s)));
                  }}
                  placeholder={`Review template ${idx + 1}...`}
                  rows={2}
                  className={`${inputCls} flex-1 resize-none`}
                />
                {clientRequestReviews.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setClientRequestReviews((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 mt-2 rounded-lg text-zinc-555 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-500 font-medium leading-normal flex items-start gap-1 mt-2">
            <span className="text-xs leading-none">⚠️</span>
            <span>
              Important: Each review in this list will be assigned to exactly one user uniquely. Make sure the template
              reviews do not contain identical text.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
