import React, { useState } from "react";
import { Badge } from "@/components/ui";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  WalletCards,
} from "lucide-react";
import { Task } from "../types";
import { formatAmount } from "../utils";
import { getBookedSlotCount, getTargetUsername } from "../../utils";

interface TaskDetailHeaderProps {
  task: Task;
  submissionsCount: number;
  onBack: () => void;
  onDownloadPDF: () => void | Promise<void>;
  onDownloadClientBrief: () => void;
  onDownloadExcel: () => void | Promise<void>;
  onEditClick: () => void;
  onToggleStatusClick: () => void;
  onBusinessPaymentAction: (action: "confirm_payment" | "approve_task" | "reject_task" | "reject_payment") => void;
  onSendReminderClick: () => void;
  toggleStatusPending: boolean;
  businessPaymentPending: boolean;
  businessPaymentAction: "confirm_payment" | "approve_task" | "reject_task" | "reject_payment" | null;
  reminderPending: boolean;
}

export function TaskDetailHeader({
  task,
  submissionsCount,
  onBack,
  onDownloadPDF,
  onDownloadClientBrief,
  onDownloadExcel,
  onEditClick,
  onToggleStatusClick,
  onBusinessPaymentAction,
  onSendReminderClick,
  toggleStatusPending,
  businessPaymentPending,
  businessPaymentAction,
  reminderPending,
}: TaskDetailHeaderProps) {
  const [copiedTargetUsername, setCopiedTargetUsername] = useState(false);
  const [copiedClientUsername, setCopiedClientUsername] = useState(false);
  const progress = Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100));
  const bookedSlotCount = getBookedSlotCount(task);
  const targetUsername = getTargetUsername(task);
  const businessInfo = parseBusinessRequestInfo(task);
  const clientUsername = task.clientUsername || (task.creatorType === "business" ? task.createdBy : "");
  const isForClient = task.isForClient || task.creatorType === "business";
  const isBusinessPaymentRequest = task.creatorType === "business" && businessInfo.paymentMethod !== "";
  const isManualPaymentRequest = isBusinessPaymentRequest && businessInfo.paymentMethod !== "paystack";
  const isPaystackPaymentRequest = isBusinessPaymentRequest && businessInfo.paymentMethod === "paystack";
  const hasConfirmedReviewer =
    !!task.verifiedBy && !["pending", "payment_pending"].includes(task.verifiedBy.toLowerCase());
  const moneyConfirmed =
    isBusinessPaymentRequest &&
    task.status !== "rejected" &&
    (hasConfirmedReviewer || (isPaystackPaymentRequest && task.status !== "payment_pending"));
  const taskFinalized = task.status === "active" || task.status === "rejected";

  const handleCopyTargetUsername = () => {
    if (!targetUsername) return;
    navigator.clipboard.writeText(targetUsername).then(() => {
      setCopiedTargetUsername(true);
      setTimeout(() => setCopiedTargetUsername(false), 1500);
    });
  };
  const handleCopyClientUsername = () => {
    if (!clientUsername) return;
    navigator.clipboard.writeText(clientUsername).then(() => {
      setCopiedClientUsername(true);
      setTimeout(() => setCopiedClientUsername(false), 1500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Submissions</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Review and action user proof of task completion</p>
        </div>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6">
        {targetUsername && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">Target Username</p>
              <p className="truncate text-sm font-bold text-zinc-100">{targetUsername}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyTargetUsername}
              className="shrink-0 rounded-lg border border-purple-400/20 bg-zinc-950/40 p-2 text-purple-200 transition-colors hover:border-purple-300/40 hover:bg-purple-500/20"
              title={copiedTargetUsername ? "Copied" : "Copy target username"}
            >
              {copiedTargetUsername ? (
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
        {isForClient && clientUsername && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300">Client username</p>
              <p className="truncate text-base font-black text-zinc-100">@{clientUsername}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyClientUsername}
              className="shrink-0 rounded-lg border border-sky-400/20 bg-zinc-950/40 p-2 text-sky-200 transition-colors hover:border-sky-300/40 hover:bg-sky-500/20"
              title={copiedClientUsername ? "Copied" : "Copy client username"}
            >
              {copiedClientUsername ? (
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
        {isBusinessPaymentRequest && (
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-amber-300" />
                  <p className="text-sm font-extrabold text-amber-200">Business task payment review</p>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 xl:grid-cols-3">
                  <BusinessInfo label="Created by" value={`@${task.createdBy}`} />
                  <BusinessInfo label="Payment method" value={businessInfo.paymentMethod || "manual"} />
                  <BusinessInfo label="Verified by" value={task.verifiedBy || "pending"} />
                  {isManualPaymentRequest ? (
                    <>
                      <BusinessInfo label="Phone" value={businessInfo.phone || "Not provided"} />
                      <BusinessInfo label="Bank" value={businessInfo.bank || "FCMB"} />
                      <BusinessInfo label="Account number" value={businessInfo.accountNumber || "1049708347"} />
                      <BusinessInfo
                        label="Account name"
                        value={businessInfo.accountName || "fluence social network ltd"}
                      />
                    </>
                  ) : null}
                  <BusinessInfo label="Client price/user" value={businessInfo.clientPricePerUser || "—"} />
                  <BusinessInfo label="Client amount paid" value={businessInfo.clientAmountPaid || "—"} />
                  <BusinessInfo label="Expected total" value={businessInfo.expectedTotalLabel || "—"} />
                  {isManualPaymentRequest ? (
                    <BusinessInfo label="Receipt file" value={businessInfo.receiptName || "—"} />
                  ) : null}
                  {isManualPaymentRequest && businessInfo.receiptUpload ? (
                    <a
                      className="font-bold text-sky-300 underline decoration-sky-300/30 underline-offset-4"
                      href={businessInfo.receiptUpload}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open receipt
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!taskFinalized && isManualPaymentRequest && !moneyConfirmed ? (
                  <>
                    <button
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/20 disabled:opacity-60"
                      disabled={businessPaymentPending}
                      onClick={() => onBusinessPaymentAction("confirm_payment")}
                      type="button"
                    >
                      {businessPaymentAction === "confirm_payment" ? "Accepting fund..." : "Accept fund"}
                    </button>
                    <button
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-60"
                      disabled={businessPaymentPending}
                      onClick={() => onBusinessPaymentAction("reject_payment")}
                      type="button"
                    >
                      {businessPaymentAction === "reject_payment" ? "Rejecting fund..." : "Reject fund"}
                    </button>
                  </>
                ) : null}
                {!taskFinalized && isPaystackPaymentRequest && task.status === "payment_pending" ? (
                  <span className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-200">
                    Waiting for Paystack payment
                  </span>
                ) : null}
                {!taskFinalized && moneyConfirmed ? (
                  <>
                    <button
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                      disabled={businessPaymentPending}
                      onClick={() => onBusinessPaymentAction("approve_task")}
                      type="button"
                    >
                      {businessPaymentAction === "approve_task" ? "Accepting..." : "Accept task"}
                    </button>
                    <button
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                      disabled={businessPaymentPending}
                      onClick={() => onBusinessPaymentAction("reject_task")}
                      type="button"
                    >
                      {businessPaymentAction === "reject_task" ? "Rejecting..." : "Reject task"}
                    </button>
                  </>
                ) : null}
                {task.status === "active" ? (
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200">
                    Task accepted
                  </span>
                ) : null}
                {task.status === "rejected" ? (
                  <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
                    Task rejected
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={task.status === "active" ? "success" : "default"} dot>
                {task.status}
              </Badge>
              <span className="text-xs text-zinc-500 capitalize">{task.taskType}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500 capitalize">{task.targetPlatform}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{task.title}</h2>
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
          </div>

          <div className="flex items-center gap-3 self-start shrink-0 flex-wrap">
            <button
              onClick={onDownloadClientBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Client Brief PDF
            </button>
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF Report
            </button>
            <button
              onClick={onDownloadExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel
            </button>
            <button
              onClick={onEditClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors"
            >
              Edit Task
            </button>
            {task.isSecureSpotTask && (
              <button
                onClick={onSendReminderClick}
                disabled={reminderPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 disabled:opacity-60 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                {reminderPending ? "Sending..." : "Reminder"}
              </button>
            )}
            {(!isBusinessPaymentRequest || task.status === "active") && (
              <button
                onClick={onToggleStatusClick}
                disabled={toggleStatusPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  task.status === "active"
                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                }`}
              >
                {toggleStatusPending ? "Updating..." : task.status === "active" ? "Close Task" : "Re-open Task"}
              </button>
            )}
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View target
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-4 pt-4 border-t border-zinc-800/60">
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Reward</p>
            <p className="text-sm font-bold text-emerald-400">{formatAmount(task.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Capacity</p>
            <p className="text-sm font-bold text-zinc-200">
              {task.approvedCount} / {task.numberOfUsersNeeded}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Deadline</p>
            <p className="text-sm font-bold text-zinc-200">
              {task.timeline ? new Date(task.timeline).toLocaleDateString() : "No Expiry / Lifeline"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Submissions</p>
            <p className="text-sm font-bold text-zinc-200">{submissionsCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Slots Booked</p>
            <p className="text-sm font-bold text-zinc-200">{bookedSlotCount ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Officer</p>
            <p className="text-sm font-bold text-zinc-200 truncate" title={task.assignedOfficer || "Auto"}>
              @{task.assignedOfficer || "Auto"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-550">Completion</span>
            <span className="font-semibold text-zinc-400">{progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : "bg-purple-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="block truncate font-bold text-zinc-200" title={value}>
        {value}
      </span>
    </div>
  );
}

function parseBusinessRequestInfo(task: Task) {
  const notes = parseReviewNotes(task.clientRequestReviews);
  const find = (prefix: string) => {
    const row = notes.find((note) => note.toLowerCase().startsWith(prefix.toLowerCase()));
    return row ? row.slice(prefix.length).trim() : "";
  };
  const clientPricePerUser = find("Client price per user:");
  const clientPricePerUserAmount = parseMoneyNumber(clientPricePerUser);
  const clientAmountPaid = find("Client amount paid:");
  const clientAmountPaidValue = parseMoneyNumber(clientAmountPaid);
  const expectedTotalAmount =
    clientAmountPaidValue ||
    (clientPricePerUserAmount && task.numberOfUsersNeeded > 0
      ? clientPricePerUserAmount * task.numberOfUsersNeeded
      : 0);
  return {
    paymentMethod: find("Payment method:").toLowerCase(),
    bank: find("Manual payment bank:"),
    accountNumber: find("Manual payment account number:"),
    accountName: find("Manual payment account name:"),
    phone: find("Payment phone:"),
    receiptName: find("Payment receipt file:"),
    receiptUpload: find("Payment receipt upload:"),
    clientPricePerUser,
    clientAmountPaid,
    expectedTotalAmount,
    expectedTotalLabel: expectedTotalAmount > 0 ? formatAmount(expectedTotalAmount) : "",
  };
}

function parseMoneyNumber(value: string) {
  const parsed = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function parseReviewNotes(raw: Task["clientRequestReviews"]) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
