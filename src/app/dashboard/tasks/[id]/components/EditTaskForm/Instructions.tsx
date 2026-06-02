import React from "react";
import { Sparkles, Plus, Trash2, GripVertical } from "lucide-react";

interface InstructionsProps {
  editInstructions: string[];
  setEditInstructions: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Instructions({ editInstructions, setEditInstructions }: InstructionsProps) {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
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

    setEditInstructions((prev) => {
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

  const loadRules = () => {
    setEditInstructions([
      "Click the target link to visit the platform page or profile.",
      "Perform the designated action (follow, like, subscribe, post status, or download).",
      "Take a clear screenshot showing the completed action (following state, liked post, status views, or downloaded app).",
      "Submit the correct proof because our system automatically audits submissions, and fake/duplicate proofs lead to immediate account suspension.",
      "Enter any requested text info (like your username or WhatsApp phone number) in the text box below.",
      "Do not undo the action (e.g., unfollowing, unliking, or deleting status post) because automated account audits run daily.",
      "Wait for review. Funds will be credited directly to your available balance upon validation.",
    ]);
  };

  const handleStepChange = (idx: number, val: string) => {
    setEditInstructions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const removeStep = (idx: number) => {
    setEditInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setEditInstructions((prev) => [...prev, ""]);
  };

  return (
    <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-zinc-300">Step-by-step Instructions</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadRules}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load 7 Rules
          </button>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Step
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {editInstructions.map((step, idx) => (
          <div
            key={idx}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            className={
              "flex gap-2 items-center p-1 rounded-xl transition-all " +
              (draggedIdx === idx ? "opacity-40 " : "") +
              (dragOverIdx === idx
                ? "border border-dashed border-purple-500 bg-purple-500/5"
                : "border border-transparent")
            }
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              className={
                "cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800 rounded " +
                "transition shrink-0 text-zinc-500 hover:text-zinc-300"
              }
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-zinc-550 font-mono w-4 text-right shrink-0">{idx + 1}.</span>
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(idx, e.target.value)}
              className={
                "flex-1 bg-zinc-850 border border-zinc-700/60 rounded-lg px-3 py-1.5 " +
                "text-zinc-200 text-xs focus:outline-none focus:border-purple-500/50"
              }
            />
            <button
              type="button"
              onClick={() => removeStep(idx)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {editInstructions.length === 0 && (
          <p className="text-zinc-650 text-xs italic text-center py-2">No instructions defined.</p>
        )}
      </div>
    </div>
  );
}
