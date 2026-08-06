import React from "react";
import { CheckCircle2, WalletCards, X, XCircle } from "lucide-react";

type BusinessPaymentAction = "confirm_payment" | "approve_task" | "reject_task" | "reject_payment";

interface BusinessPaymentConfirmModalProps {
  action: BusinessPaymentAction;
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

const COPY: Record<
  BusinessPaymentAction,
  { title: string; body: string; confirmLabel: string; pendingLabel: string; tone: "accept" | "reject" }
> = {
  confirm_payment: {
    title: "Accept fund",
    body: "Confirm you have received the client's manual payment for this task (see the payment details above). This will mark the payment as verified.",
    confirmLabel: "Accept fund",
    pendingLabel: "Accepting fund...",
    tone: "accept",
  },
  reject_payment: {
    title: "Reject fund",
    body: "This will reject the client's payment and mark the task as rejected.",
    confirmLabel: "Reject fund",
    pendingLabel: "Rejecting fund...",
    tone: "reject",
  },
  approve_task: {
    title: "Accept task",
    body: "This will activate the task and make it live for users.",
    confirmLabel: "Accept task",
    pendingLabel: "Accepting...",
    tone: "accept",
  },
  reject_task: {
    title: "Reject task",
    body: "This will reject the task and refund any unused client funds.",
    confirmLabel: "Reject task",
    pendingLabel: "Rejecting...",
    tone: "reject",
  },
};

export function BusinessPaymentConfirmModal({
  action,
  isPending,
  error,
  onClose,
  onConfirm,
}: BusinessPaymentConfirmModalProps) {
  const copy = COPY[action];
  const isAccept = copy.tone === "accept";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletCards className={`w-4 h-4 ${isAccept ? "text-emerald-400" : "text-red-400"}`} />
            <h3 className="text-sm font-bold text-zinc-100">{copy.title}</h3>
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
          <p className="text-sm text-zinc-300">Are you sure you want to {isAccept ? "accept" : "reject"}?</p>
          <p className="text-xs text-zinc-500">{copy.body}</p>

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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 ${
              isAccept
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
            }`}
          >
            {isAccept ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isPending ? copy.pendingLabel : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
