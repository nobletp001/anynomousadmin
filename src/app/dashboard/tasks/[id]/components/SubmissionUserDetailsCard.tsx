import React from "react";
import { Badge } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { Submission } from "../types";
import {
  formatAmount,
  statusVariant,
  getDuplicateWarning,
  getIpWarning,
  getDeviceWarning,
} from "../utils";

interface SubmissionUserDetailsCardProps {
  sub: Submission;
  submissions: Submission[];
}

export function SubmissionUserDetailsCard({ sub, submissions }: SubmissionUserDetailsCardProps) {
  const whatsappNum = (sub.user as any)?.whatsappNumber;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
      <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
        User Details
      </h4>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-purple-400">
          {(sub.user?.name ?? sub.username).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-sm text-zinc-200">{sub.user?.name || "—"}</p>
          <p className="text-zinc-550 text-xs">@{sub.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900/60">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Wallet Balance</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatAmount(sub.userBalance)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Status</p>
          <div className="mt-1">
            <Badge variant={statusVariant(sub.status)} dot>{sub.status}</Badge>
          </div>
        </div>
      </div>

      {(getDuplicateWarning(sub, submissions) || getIpWarning(sub, submissions) || getDeviceWarning(sub, submissions)) && (
        <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Security Alerts</p>
          <div className="flex flex-col gap-1.5">
            {getDuplicateWarning(sub, submissions) && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{getDuplicateWarning(sub, submissions)}</span>
              </div>
            )}
            {getIpWarning(sub, submissions) && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{getIpWarning(sub, submissions)} (IP: {sub.ipAddress})</span>
              </div>
            )}
            {getDeviceWarning(sub, submissions) && (
              <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{getDeviceWarning(sub, submissions)} (Device: {sub.deviceId?.substring(0, 8)}...)</span>
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
