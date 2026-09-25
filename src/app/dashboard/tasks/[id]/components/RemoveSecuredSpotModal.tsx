import React from "react";
import { Trash2, X } from "lucide-react";
import { SecuredSpot } from "../types";

interface RemoveSecuredSpotModalProps {
  spot: SecuredSpot;
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveSecuredSpotModal({ spot, isPending, error, onClose, onConfirm }: RemoveSecuredSpotModalProps) {
  const errorMessage =
    (error as Error & { response?: { data?: { error?: string } } })?.response?.data?.error || error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-zinc-100">Remove Booked Slot</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-zinc-300">
            Remove <span className="font-bold text-zinc-100">@{spot.username}</span>&apos;s booked slot for this task?
          </p>
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
            This frees the slot so another user can book it, and the booked-slot count will reduce after removal.
          </p>
          {errorMessage && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/30 disabled:opacity-50"
          >
            {isPending ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-red-200/30 border-t-red-200 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isPending ? "Removing..." : "Remove Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
