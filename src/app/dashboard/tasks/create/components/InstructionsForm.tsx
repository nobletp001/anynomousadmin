import React from "react";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";

interface InstructionsFormProps {
  instructions: string[];
  setInstructions: React.Dispatch<React.SetStateAction<string[]>>;
  draggedIdx: number | null;
  setDraggedIdx: (v: number | null) => void;
}

export function InstructionsForm({ instructions, setInstructions, draggedIdx, setDraggedIdx }: InstructionsFormProps) {
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    setInstructions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const loadPresetRules = () => {
    setInstructions([
      "Click the target link to visit the platform page or profile.",
      "Perform the designated action (follow, like, subscribe, post status, or download).",
      "Take a clear screenshot showing the completed action (following state, liked post, status views, or downloaded app).",
      "Submit the correct proof because our system automatically audits submissions, and fake/duplicate proofs lead to immediate account suspension.",
      "Enter any requested text info (like your username or WhatsApp phone number) in the text box below.",
      "Do not undo the action (e.g., unfollowing, unliking, or deleting status post) because automated account audits run daily.",
      "Wait for review. Funds will be credited directly to your available balance upon validation.",
    ]);
  };

  const inputCls =
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-zinc-300">Step-by-step Instructions</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPresetRules}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load 7-Step Rules
          </button>
          <button
            type="button"
            onClick={() => setInstructions((prev) => [...prev, ""])}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add step
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {instructions.map((step, idx) => (
          <div
            key={idx}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            className={`flex items-center gap-2 p-1 rounded-xl transition-all ${
              draggedIdx === idx ? "opacity-35" : ""
            } ${
              dragOverIdx === idx
                ? "border border-dashed border-purple-500 bg-purple-500/5"
                : "border border-transparent"
            }`}
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div className={`flex items-center gap-2 flex-1 ${draggedIdx !== null ? "pointer-events-none" : ""}`}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                {idx + 1}
              </span>
              <input
                value={step}
                onChange={(e) => {
                  const val = e.target.value;
                  setInstructions((prev) => prev.map((s, i) => (i === idx ? val : s)));
                }}
                placeholder={`Step ${idx + 1}...`}
                className={`${inputCls} flex-1`}
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setInstructions((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 rounded-lg text-zinc-550 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600">Tell users exactly what to do, step by step.</p>
    </div>
  );
}
