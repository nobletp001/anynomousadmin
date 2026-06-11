"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";
import { PayoutBreakdown, PayoutClaim } from "../types";
import { fmt } from "../utils";
import { TaskCompletionsList } from "./payout-breakdown/TaskCompletionsList";
import { ReferralEarningsList } from "./payout-breakdown/ReferralEarningsList";
import { BalanceSummary } from "./payout-breakdown/BalanceSummary";
import { AdminAdjustmentsList } from "./payout-breakdown/AdminAdjustmentsList";
import { PreviousPayoutsList } from "./payout-breakdown/PreviousPayoutsList";
import { UserBankGrid } from "./payout-breakdown/UserBankGrid";
import { FraudAlertsList } from "./payout-breakdown/FraudAlertsList";

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

interface Props {
  claim: PayoutClaim;
  onClose: () => void;
  onPay: (id: number) => void;
  onReject: (id: number) => void;
  actionDisabled: boolean;
}

export function PayoutBreakdownModal({ claim, onClose, onPay, onReject, actionDisabled }: Props) {
  const [data, setData] = useState<PayoutBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reversingId, setReversingId] = useState<number | null>(null);

  const handleReverseSubmission = async (taskId: number, subId: number) => {
    if (!confirm("Are you sure you want to reverse/revoke this task completion?")) return;
    try {
      setReversingId(subId);
      await apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}/report`, {
        deductedAmount: 0,
        rejectionReason: "Reversed/Revoked by Admin during payout review",
      });
      const res = await (apiClient.get(`/admin/payouts/${claim.id}/breakdown`) as Promise<{
        success: boolean;
        data: PayoutBreakdown;
      }>);
      setData(res.data);
    } catch (err: any) {
      alert(err?.message || "Failed to reverse submission");
    } finally {
      setReversingId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    (apiClient.get(`/admin/payouts/${claim.id}/breakdown`) as Promise<{ success: boolean; data: PayoutBreakdown }>)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load breakdown");
        setLoading(false);
      });
  }, [claim.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Payout Review</p>
            <p className="text-base font-extrabold text-zinc-100 mt-0.5">
              <Link
                href={`/dashboard/users/${claim.username}`}
                className="hover:text-purple-400 hover:underline cursor-pointer"
              >
                @{claim.username}
              </Link>{" "}
              — {fmt(claim.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-900" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-400 font-semibold">{error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : data ? (
            <>
              {/* Verification banner */}
              {data.verification.warning ? (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300 font-semibold">{data.verification.warning}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300 font-semibold">
                    Balance verified — claim amount matches available earnings
                  </p>
                </div>
              )}

              {/* Task Completions */}
              <TaskCompletionsList
                taskBreakdown={data.taskBreakdown}
                reversingId={reversingId}
                actionDisabled={actionDisabled}
                handleReverseSubmission={handleReverseSubmission}
              />

              {/* Referral Earnings */}
              <ReferralEarningsList referralBreakdown={data.referralBreakdown} />

              {/* User & bank */}
              <UserBankGrid user={data.user} bankDetails={data.bankDetails} username={claim.username} />

              {/* Balance summary */}
              <BalanceSummary balance={data.balance} verification={data.verification} />

              {/* Claim split */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Micro Tasks</p>
                  <p className="text-base font-extrabold text-zinc-100">{fmt2(data.claim.microAmount)}</p>
                </div>
                <div className="flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Referrals</p>
                  <p className="text-base font-extrabold text-purple-400">{fmt2(data.claim.referralAmount)}</p>
                </div>
              </div>

              {/* Admin adjustments */}
              <AdminAdjustmentsList adminAdjustments={data.adminAdjustments} />

              {/* Fraud alerts */}
              <FraudAlertsList fraudAlerts={data.fraudAlerts} />

              {/* Previous payouts */}
              <PreviousPayoutsList previousPayouts={data.previousPayouts} />
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        {!loading && !error && data && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-800/60 bg-zinc-900/20 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              disabled={actionDisabled}
            >
              Cancel
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onReject(claim.id);
                onClose();
              }}
              disabled={actionDisabled}
              className="border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white"
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onPay(claim.id);
                onClose();
              }}
              disabled={actionDisabled || !data.verification.checksOut}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {data.verification.checksOut ? "Approve Payment" : "Balance Mismatch"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
