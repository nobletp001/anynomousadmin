import React from "react";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";

interface InstructionsFormProps {
  instructions: string[];
  setInstructions: React.Dispatch<React.SetStateAction<string[]>>;
  draggedIdx: number | null;
  setDraggedIdx: (v: number | null) => void;
}

export function InstructionsForm({
  instructions,
  setInstructions,
  draggedIdx,
  setDraggedIdx,
}: InstructionsFormProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    setInstructions((prev) => {
      const list = [...prev];
      const draggedItem = list[draggedIdx];
      list.splice(draggedIdx, 1);
      list.splice(index, 0, draggedItem);
      return list;
    });
    setDraggedIdx(index);
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
    "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors";

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
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={() => setDraggedIdx(null)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              draggedIdx === idx ? "opacity-30 scale-[0.98] border-purple-500/50 bg-purple-950/5" : ""
            }`}
          >
            <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-650 hover:text-zinc-400 transition-colors shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
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
                className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600">Tell users exactly what to do, step by step.</p>
    </div>
  );
}
