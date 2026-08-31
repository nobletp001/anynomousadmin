import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface AppTestingQualifyModalProps {
  username: string;
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function AppTestingQualifyModal({
  username,
  isPending,
  error,
  onClose,
  onConfirm,
}: AppTestingQualifyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-zinc-100">Approve Portfolio</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-300">
            Approve <span className="font-bold text-zinc-100">@{username}</span>&apos;s portfolio for the app testing
            stage?
          </p>
          <p className="text-xs text-zinc-500">
            This only qualifies the applicant for app testing. It does not pay the user yet.
          </p>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {(error as Error & { response?: { data?: { error?: string } } })?.response?.data?.error || error.message}
            </p>
          )}
        </div>

        <div className="p-5 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isPending ? "Approving..." : "Approve Portfolio"}
          </button>
        </div>
      </div>
    </div>
  );
}
