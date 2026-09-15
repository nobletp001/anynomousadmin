import React from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Phone, XCircle } from "lucide-react";
import { Badge } from "@/components/ui";
import type { RegistrationPaymentReview } from "../types";
import { formatDateTime, formatRelativeTime } from "../utils";

interface Props {
  payments: RegistrationPaymentReview[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalPayments: number;
  hasMore?: boolean;
  reviewingId?: number | null;
  onReview: (id: number, status: "approved" | "rejected", note?: string) => void;
}

export function RegistrationPaymentReviewTable({
  payments,
  page,
  setPage,
  totalPages,
  totalPayments,
  hasMore = false,
  reviewingId,
  onReview,
}: Props) {
  const [selected, setSelected] = React.useState<RegistrationPaymentReview | null>(null);
  const [note, setNote] = React.useState("");
  const canGoNext = hasMore || page < totalPages;

  const submitReview = (status: "approved" | "rejected") => {
    if (!selected) return;
    onReview(selected.id, status, note.trim() || undefined);
    setSelected(null);
    setNote("");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-200">Registration Payment Review</h2>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            Approve task performer ₦500 bank-transfer receipts before dashboard access.
          </p>
        </div>
        <Badge variant="warning">{totalPayments} pending</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Payment</th>
              <th className="px-6 py-4 font-semibold">Receipt</th>
              <th className="px-6 py-4 font-semibold">Submitted</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {payments.length ? (
              payments.map((payment) => {
                const meta = payment.providerResponse || {};
                return (
                  <tr key={payment.id} className="transition-colors hover:bg-zinc-800/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-100">{payment.userName || payment.intendedName || "—"}</p>
                      <p className="text-xs text-zinc-500">@{payment.username || payment.intendedUsername || "—"}</p>
                      <Badge variant={payment.userEmailVerified ? "success" : "warning"} dot>
                        {payment.userEmailVerified ? "email verified" : "email pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-[260px] truncate text-xs font-semibold text-zinc-300">
                        {payment.userEmail || payment.email}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <Phone className="h-3.5 w-3.5" />
                        {payment.userWhatsappNumber || payment.intendedWhatsappNumber || meta.payerPhone || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-zinc-100">₦{payment.amount.toLocaleString()}</p>
                      <p className="text-xs font-semibold text-zinc-500">
                        {meta.bankName || "FCMB"} · {meta.accountNumber || "1049708347"}
                      </p>
                      {meta.transferReference ? (
                        <p className="mt-1 max-w-[220px] truncate text-[11px] font-semibold text-zinc-400">
                          Ref: {String(meta.transferReference)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelected(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 transition-colors hover:bg-purple-500/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View proof
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="whitespace-nowrap text-xs font-semibold text-zinc-300">
                        {formatDateTime(payment.createdAt)}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-zinc-500">
                        {formatRelativeTime(payment.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={reviewingId === payment.id}
                          onClick={() => onReview(payment.id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === payment.id}
                          onClick={() => {
                            setSelected(payment);
                            setNote("Receipt could not be confirmed from bank record.");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                  No pending registration payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/60 px-6 py-4">
        <span className="text-xs font-semibold text-zinc-500">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-zinc-100">Registration Payment Proof</h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  @{selected.username || selected.intendedUsername} · {selected.userEmail || selected.email}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.1fr]">
              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs font-semibold text-zinc-300">
                <p>Name: {selected.userName || selected.intendedName || "—"}</p>
                <p>Email: {selected.userEmail || selected.email}</p>
                <p>WhatsApp: {selected.userWhatsappNumber || selected.intendedWhatsappNumber || "—"}</p>
                <p>Amount: ₦{selected.amount.toLocaleString()}</p>
                <p>Bank: {selected.providerResponse?.bankName || "FCMB"}</p>
                <p>Account: {selected.providerResponse?.accountNumber || "1049708347"}</p>
                <p>Receipt: {selected.providerResponse?.receiptName || "uploaded proof"}</p>
              </div>
              <div className="min-h-72 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
                {selected.providerResponse?.receiptDataUrl?.startsWith("data:application/pdf") ? (
                  <iframe title="Receipt PDF" src={selected.providerResponse.receiptDataUrl} className="h-96 w-full" />
                ) : selected.providerResponse?.receiptDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Admin must inspect uploaded receipt data URLs.
                  <img src={selected.providerResponse.receiptDataUrl} alt="Payment receipt" className="h-auto w-full" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-xs font-bold text-zinc-500">
                    No receipt preview available
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional review note"
              className="mt-4 min-h-24 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-purple-500/60"
            />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => submitReview("rejected")}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black text-red-300"
              >
                Reject Payment
              </button>
              <button
                type="button"
                onClick={() => submitReview("approved")}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-300"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
