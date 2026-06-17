"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { usePayoutState } from "./hooks/usePayoutState";
import { usePayoutQueries } from "./hooks/usePayoutQueries";
import { usePayoutMutations } from "./hooks/usePayoutMutations";
import { PayoutRequestsTab } from "./components/PayoutRequestsTab";
import { PayoutHistoryTab } from "./components/PayoutHistoryTab";
import { PayoutControls } from "./components/PayoutControls";
import { PayoutBreakdownModal } from "./components/PayoutBreakdownModal";
import { PayoutClaim } from "./types";
import { fmt } from "./utils";

interface PendingConfirm {
  id: number;
  idempotencyKey: string;
  expiresAt: number;
  claim: PayoutClaim;
}

export default function PayoutsPage() {
  const state = usePayoutState();
  const { data, isLoading, error, refetch } = usePayoutQueries();
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [secsLeft, setSecsLeft] = useState(60);
  const [breakdownClaim, setBreakdownClaim] = useState<PayoutClaim | null>(null);

  const claims = data?.data ?? [];
  const requests = claims.filter((c) => c.status === "in review");

  const mutations = usePayoutMutations({
    onSuccess: () => state.setActionError(null),
    onError: (err) => state.setActionError(err?.message || "Failed to update status"),
    onConfirmRequired: (expiresInSeconds, claimId, idempotencyKey) => {
      const claim = requests.find((c) => c.id === claimId);
      if (!claim) return;
      setPendingConfirm({
        id: claimId,
        idempotencyKey,
        expiresAt: Date.now() + expiresInSeconds * 1000,
        claim,
      });
      setConfirmCode("");
      setSecsLeft(expiresInSeconds);
      state.setActionError(null);
    },
  });

  // Countdown timer for the confirmation modal
  useEffect(() => {
    if (!pendingConfirm) return;
    if (secsLeft <= 0) {
      setPendingConfirm(null);
      state.setActionError("Confirmation window expired — click Mark Paid again to get a new token.");
      return;
    }
    const t = setTimeout(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [pendingConfirm, secsLeft]);

  const handleConfirm = () => {
    if (!pendingConfirm) return;
    if (!confirmCode.trim()) {
      state.setActionError("Enter the confirmation code sent to your admin email.");
      return;
    }
    mutations.mutate({
      id: pendingConfirm.id,
      status: "paid",
      confirmToken: confirmCode.trim(),
      idempotencyKey: pendingConfirm.idempotencyKey,
    });
    setPendingConfirm(null);
    setConfirmCode("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-zinc-800 rounded w-72" />
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
        </div>
        <div className="border border-zinc-800/80 rounded-2xl bg-zinc-900/10 overflow-hidden divide-y divide-zinc-800/40">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-5 px-6 py-5">
              <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-36" />
                <div className="h-3.5 bg-zinc-800 rounded w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-sm font-bold text-zinc-200">Failed to load payout data</h3>
        <p className="text-zinc-550 text-xs max-w-sm">Please check your network connection and try again.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Large-payout confirmation modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-amber-500/30 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/60 bg-amber-500/5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                Large Payout — Confirm
              </span>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-zinc-300">
                You are about to approve a payout of{" "}
                <span className="font-black text-emerald-400">{fmt(pendingConfirm.claim.amount)}</span> to{" "}
                <span className="font-bold text-zinc-100">@{pendingConfirm.claim.username}</span>.
              </p>
              <p className="text-xs text-zinc-500">
                This amount exceeds the ₦3,000 threshold. Enter the confirmation code sent to your admin email.
              </p>
              <input
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.trim())}
                placeholder="Confirmation code"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none transition focus:border-amber-500/50"
              />
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800/60">
                <span className="text-xs text-zinc-500">Confirmation window</span>
                <span
                  className={`text-sm font-black tabular-nums ${secsLeft <= 10 ? "text-red-400" : "text-zinc-200"}`}
                >
                  {secsLeft}s
                </span>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPendingConfirm(null);
                  setConfirmCode("");
                }}
                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                disabled={mutations.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={mutations.isPending || secsLeft <= 0 || !confirmCode.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {mutations.isPending ? "Processing…" : "Confirm Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payouts</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage user balances and payout claim requests</p>
        </div>

        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <button
            onClick={() => state.setTab("requests")}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              state.tab === "requests" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => state.setTab("history")}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              state.tab === "history" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
            }`}
          >
            History
          </button>
        </div>
      </div>

      <PayoutControls />

      {state.actionError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.actionError}</span>
        </div>
      )}

      {/* Breakdown modal — opens before the existing large-payout confirm modal */}
      {breakdownClaim && (
        <PayoutBreakdownModal
          claim={breakdownClaim}
          onClose={() => setBreakdownClaim(null)}
          onPay={(id) => mutations.mutate({ id, status: "paid" })}
          onReject={(id) => mutations.mutate({ id, status: "rejected" })}
          actionDisabled={mutations.isPending}
        />
      )}

      {state.tab === "requests" ? (
        <PayoutRequestsTab
          requests={requests}
          onAction={(id, status) => mutations.mutate({ id, status })}
          onViewBreakdown={(claim) => setBreakdownClaim(claim)}
          disabled={mutations.isPending}
        />
      ) : (
        <PayoutHistoryTab
          claims={claims}
          dateFilter={state.dateFilter}
          setDateFilter={state.setDateFilter}
          customDate={state.customDate}
          setCustomDate={state.setCustomDate}
        />
      )}
    </div>
  );
}
