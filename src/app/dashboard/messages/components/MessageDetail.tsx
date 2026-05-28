import React from "react";
import { User, CreditCard, GitMerge, MessageSquare } from "lucide-react";
import { InfoRow } from "./InfoRow";
import { EnrichedMessage } from "../types";

interface MessageDetailProps {
  msg: EnrichedMessage;
}

export function MessageDetail({ msg }: MessageDetailProps) {
  return (
    <tr>
      <td colSpan={5} className="px-6 pb-5 bg-zinc-900/50">
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-zinc-800/40 border-b border-zinc-800">
            <p className="text-sm text-zinc-200 leading-relaxed">{msg.content}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sender</span>
              </div>
              {msg.sender ? (
                <>
                  <InfoRow label="Name" value={msg.sender.name} />
                  <InfoRow label="Username" value={<span className="text-purple-400">@{msg.sender.username}</span>} />
                  {msg.sender.bankDetails ? (
                    <div className="pt-2 mt-2 border-t border-zinc-800/60">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-550 font-medium">Bank Details</span>
                      </div>
                      <InfoRow label="Bank" value={msg.sender.bankDetails.bankName} />
                      <InfoRow label="Account" value={msg.sender.bankDetails.accountNumber} />
                      <InfoRow label="Acc. Name" value={msg.sender.bankDetails.accountName} />
                      <InfoRow label="WhatsApp" value={msg.sender.bankDetails.whatsappNumber} />
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-650 pt-1">No bank details on file</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-650">Anonymous — no sender info</p>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Referred By</span>
              </div>
              {msg.sender?.referredBy ? (
                <>
                  <InfoRow
                    label="Username"
                    value={<span className="text-emerald-400">@{msg.sender.referredBy.referrerUsername}</span>}
                  />
                  {msg.sender.referredBy.referrer && (
                    <InfoRow label="Name" value={msg.sender.referredBy.referrer.name} />
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-650">
                  {msg.sender ? "Sender was not referred" : "N/A — anonymous message"}
                </p>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Receiver</span>
              </div>
              {msg.receiver ? (
                <>
                  <InfoRow label="Name" value={msg.receiver.name} />
                  <InfoRow label="Username" value={<span className="text-blue-400">@{msg.receiver.username}</span>} />
                </>
              ) : (
                <InfoRow label="Username" value={<span className="text-blue-400">@{msg.receiverUsername}</span>} />
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
