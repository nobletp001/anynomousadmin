import React from "react";
import { Badge } from "@/components/ui";
import { AlertCircle, Users } from "lucide-react";
import { Submission } from "../types";
import { formatAmount, statusVariant } from "../utils";

interface SubmissionUserDetailsCardProps {
  sub: Submission;
  submissions: Submission[];
  onCompareUser?: (username: string) => void;
}

export function SubmissionUserDetailsCard({
  sub,
  submissions,
  onCompareUser,
}: SubmissionUserDetailsCardProps) {
  const whatsappNum = (sub.user as any)?.whatsappNumber;
  const accountNumber = (sub.user as any)?.accountNumber;
  const bankName = (sub.user as any)?.bankName;
  const accountName = (sub.user as any)?.accountName;

  const dupSub = submissions.find(
    (s) => s.id !== sub.id && s.proof === sub.proof && s.proofType === sub.proofType && sub.proof && sub.proofType !== "text"
  );
  const ipSub = submissions.find((s) => s.id !== sub.id && s.ipAddress === sub.ipAddress && sub.ipAddress);
  const devSub = submissions.find((s) => s.id !== sub.id && s.deviceId === sub.deviceId && sub.deviceId);
  const bankSub = submissions.find(
    (s) => s.id !== sub.id && (s.user as any)?.accountNumber === accountNumber && accountNumber
  );

  const hasAlerts = dupSub || ipSub || devSub || bankSub;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
      <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
        User Details
      </h4>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-purple-400 shrink-0">
            {(sub.user?.name ?? sub.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-zinc-200 truncate">{sub.user?.name || "—"}</p>
            <p className="text-zinc-555 text-xs truncate">@{sub.username}</p>
          </div>
        </div>
        
        {onCompareUser && hasAlerts && (
          <button
            onClick={() => onCompareUser(sub.username)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition cursor-pointer"
            title="Inspect all collisions side-by-side"
          >
            <Users className="w-3 h-3" />
            Compare
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900/60">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Wallet Balance</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatAmount(sub.userBalance)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Status</p>
          <div className="mt-1">
            <Badge variant={statusVariant(sub.status)} dot>
              {sub.status}
            </Badge>
          </div>
        </div>
      </div>

      {accountNumber && (
        <div className="pt-2 border-t border-zinc-900/60 text-xs">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Bank Details</p>
          <div className="space-y-0.5 text-zinc-350">
            <p className="font-mono"><span className="text-zinc-550">Acc:</span> {accountNumber}</p>
            <p><span className="text-zinc-550">Bank:</span> {bankName}</p>
            <p className="truncate"><span className="text-zinc-550">Name:</span> {accountName}</p>
          </div>
        </div>
      )}

      {hasAlerts && (
        <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Security Alerts</p>
          <div className="flex flex-col gap-1.5">
            {dupSub && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Duplicate proof matching{" "}
                  <button
                    onClick={() => onCompareUser?.(dupSub.username)}
                    className="font-bold underline text-red-300 hover:text-red-200 cursor-pointer"
                  >
                    @{dupSub.username}
                  </button>
                </div>
              </div>
            )}
            {ipSub && (
              <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Same IP as{" "}
                  <button
                    onClick={() => onCompareUser?.(ipSub.username)}
                    className="font-bold underline text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    @{ipSub.username}
                  </button>{" "}
                  (IP: {sub.ipAddress})
                </div>
              </div>
            )}
            {devSub && (
              <div className="flex items-start gap-2 text-xs text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Same Device as{" "}
                  <button
                    onClick={() => onCompareUser?.(devSub.username)}
                    className="font-bold underline text-yellow-400 hover:text-yellow-350 cursor-pointer"
                  >
                    @{devSub.username}
                  </button>{" "}
                  (Device: {sub.deviceId?.substring(0, 8)}...)
                </div>
              </div>
            )}
            {bankSub && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Same Bank Account as{" "}
                  <button
                    onClick={() => onCompareUser?.(bankSub.username)}
                    className="font-bold underline text-red-300 hover:text-red-200 cursor-pointer"
                  >
                    @{bankSub.username}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {whatsappNum && (
        <div className="pt-2 border-t border-zinc-900/60 flex flex-col gap-0.5">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">WhatsApp Contact</p>
          <a
            href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-0.5"
          >
            {whatsappNum}
          </a>
        </div>
      )}
    </div>
  );
}
