"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  ListChecks,
  Banknote,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";
import { PayoutBreakdown, PayoutClaim } from "../types";
import { fmt } from "../utils";

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
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [referralsExpanded, setReferralsExpanded] = useState(false);

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
              @{claim.username} — {fmt(claim.amount)}
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

              {/* User & bank */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">User</p>
                  <p className="text-sm font-bold text-zinc-100">{data.user?.name ?? claim.username}</p>
                  <p className="text-xs text-zinc-500">@{claim.username}</p>
                  {data.user?.disabled && (
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-400">
                      Disabled
                    </span>
                  )}
                  {(data.user?.violationDebt ?? 0) > 0 && (
                    <p className="text-[10px] text-amber-400 font-semibold">
                      Violation debt: {fmt2(data.user!.violationDebt)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bank Details</p>
                  {data.bankDetails ? (
                    <>
                      <p className="text-sm font-bold text-zinc-100">{data.bankDetails.accountName}</p>
                      <p className="text-xs text-zinc-400">{data.bankDetails.accountNumber}</p>
                      <p className="text-xs text-zinc-500">{data.bankDetails.bankName}</p>
                    </>
                  ) : (
                    <p className="text-xs text-amber-400">No bank details found</p>
                  )}
                </div>
              </div>

              {/* Balance summary */}
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Balance Breakdown</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <Row label="Task earnings" value={fmt2(data.balance.totalMicroEarnings)} />
                  <Row label="Referral earnings" value={fmt2(data.balance.clearedReferralEarnings)} />
                  {data.balance.adminAdditions > 0 && (
                    <Row label="Admin bonuses" value={fmt2(data.balance.adminAdditions)} color="emerald" />
                  )}
                  {data.balance.adminDeductions > 0 && (
                    <Row label="Admin deductions" value={`-${fmt2(data.balance.adminDeductions)}`} color="red" />
                  )}
                  <Row label="Previously paid" value={`-${fmt2(data.balance.totalClaimed)}`} />
                  {data.balance.reviewMoney > 0 && (
                    <Row label="In review (this claim)" value={`-${fmt2(data.balance.reviewMoney)}`} />
                  )}
                  <div className="col-span-2 mt-1 pt-1.5 border-t border-zinc-800/60 flex justify-between font-extrabold">
                    <span className="text-zinc-300">Available (before claim)</span>
                    <span className={data.verification.checksOut ? "text-emerald-400" : "text-red-400"}>
                      {fmt2(data.verification.effectiveAvailable)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-between font-extrabold text-sm pt-0.5">
                    <span className="text-zinc-200">This claim</span>
                    <span className="text-purple-300">{fmt2(data.verification.claimAmount)}</span>
                  </div>
                </div>
              </div>

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

              {/* Task breakdown (collapsible) */}
              <Section
                icon={<ListChecks className="w-3.5 h-3.5" />}
                title={`Task Completions (${data.taskBreakdown.length})`}
                expanded={tasksExpanded}
                onToggle={() => setTasksExpanded((v) => !v)}
              >
                {data.taskBreakdown.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">No approved task submissions.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {data.taskBreakdown.map((t) => (
                      <div
                        key={t.submissionId}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900/50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <TokenBadge status={t.tokenStatus} />
                          <span className="text-xs text-zinc-300 truncate">{t.taskTitle}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-100 shrink-0">{fmt2(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Referral breakdown (collapsible) */}
              {data.referralBreakdown.length > 0 && (
                <Section
                  icon={<Users className="w-3.5 h-3.5" />}
                  title={`Referral Earnings (${data.referralBreakdown.length} referrals)`}
                  expanded={referralsExpanded}
                  onToggle={() => setReferralsExpanded((v) => !v)}
                >
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {data.referralBreakdown.map((r) => (
                      <div key={r.referredUsername} className="px-3 py-2.5 rounded-lg bg-zinc-900/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-zinc-200">@{r.referredUsername}</p>
                            {r.referredName && <p className="text-[10px] text-zinc-500">{r.referredName}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-purple-400">{fmt2(r.earned)}</p>
                            {r.pending > 0 && <p className="text-[10px] text-zinc-500">+{fmt2(r.pending)} pending</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 rounded-full bg-zinc-800 flex-1 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${(r.earned / 100) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500">{r.approvedCount} tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Admin adjustments */}
              {data.adminAdjustments.length > 0 && (
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Admin Adjustments ({data.adminAdjustments.length})
                    </p>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {data.adminAdjustments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900/50"
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md mr-2 ${a.actionType === "additional" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                          >
                            {a.actionType}
                          </span>
                          <span className="text-xs text-zinc-400 truncate">{a.message}</span>
                        </div>
                        <span
                          className={`text-xs font-bold shrink-0 ${a.actionType === "additional" ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {a.actionType === "additional" ? "+" : "-"}
                          {fmt2(a.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fraud alerts */}
              {data.fraudAlerts.filter((f) => !f.resolved).length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Fraud Alerts ({data.fraudAlerts.filter((f) => !f.resolved).length} unresolved)
                    </p>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {data.fraudAlerts
                      .filter((f) => !f.resolved)
                      .map((f) => (
                        <div key={f.id} className="px-3 py-2 rounded-lg bg-zinc-950/60">
                          <div className="flex items-center gap-2 mb-0.5">
                            <SeverityBadge severity={f.severity} />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              {f.alertType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{f.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Previous payouts */}
              {data.previousPayouts.length > 0 && (
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Previous Payouts ({data.previousPayouts.length})
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {data.previousPayouts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-zinc-400">
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                            {p.paidBy ? ` by ${p.paidBy}` : ""}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-zinc-200">{fmt2(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

function Row({ label, value, color }: { label: string; value: string; color?: "emerald" | "red" }) {
  const colorClass = color === "emerald" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-zinc-300";
  return (
    <>
      <span className="text-zinc-500">{label}</span>
      <span className={`text-right font-semibold ${colorClass}`}>{value}</span>
    </>
  );
}

function Section({
  icon,
  title,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-zinc-800/30 transition rounded-xl"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function TokenBadge({ status }: { status: "valid" | "legacy" | "invalid" }) {
  if (status === "valid")
    return <span title="Platform-verified token" className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
  if (status === "legacy")
    return <span title="Legacy submission (pre-token era)" className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />;
  return <span title="Invalid token — excluded from balance" className="w-2 h-2 rounded-full bg-red-500 shrink-0" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === "critical"
      ? "bg-red-500/20 text-red-400"
      : severity === "high"
        ? "bg-orange-500/20 text-orange-400"
        : "bg-amber-500/20 text-amber-400";
  return <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${cls}`}>{severity}</span>;
}
