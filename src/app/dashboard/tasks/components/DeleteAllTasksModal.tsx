import React from "react";
import { Trash2, X } from "lucide-react";

interface DeleteAllTasksModalProps {
  tasksCount: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAllTasksModal({ tasksCount, isPending, onClose, onConfirm }: DeleteAllTasksModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-zinc-100">Delete all tasks?</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            This will permanently delete all{" "}
            <span className="font-semibold text-zinc-200">
              {tasksCount} task{tasksCount !== 1 ? "s" : ""}
            </span>{" "}
            and all their submissions. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-500/90 hover:bg-red-500 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Delete All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
