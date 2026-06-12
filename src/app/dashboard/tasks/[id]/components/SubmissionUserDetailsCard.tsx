import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui";
import { AlertCircle, Users, ScanSearch } from "lucide-react";
import { Submission } from "../types";
import { formatAmount, statusVariant } from "../utils";
import { FraudAlertsList } from "./FraudAlertsList";
import { SubmissionCollisionModal } from "./SubmissionCollisionModal";
import { apiClient } from "@/services/api-client";

interface SubmissionUserDetailsCardProps {
  sub: Submission;
  submissions: Submission[];
  onCompareUser?: (username: string) => void;
}

export function SubmissionUserDetailsCard({ sub, submissions, onCompareUser }: SubmissionUserDetailsCardProps) {
  const [collision, setCollision] = useState<{ type: string; value: string } | null>(null);

  const whatsappNum = (sub.user as any)?.whatsappNumber;
  const accountNumber = (sub.user as any)?.accountNumber;
  const bankName = (sub.user as any)?.bankName;
  const accountName = (sub.user as any)?.accountName;

  const dupSub = submissions.find(
    (s) =>
      s.id !== sub.id &&
      s.username !== sub.username &&
      s.proof === sub.proof &&
      s.proofType === sub.proofType &&
      sub.proof &&
      sub.proofType !== "text"
  );
  const ipSub = submissions.find(
    (s) => s.id !== sub.id && s.username !== sub.username && s.ipAddress === sub.ipAddress && sub.ipAddress
  );
  const devSub = submissions.find(
    (s) => s.id !== sub.id && s.username !== sub.username && s.deviceId === sub.deviceId && sub.deviceId
  );
  const bankSub = submissions.find(
    (s) =>
      s.id !== sub.id &&
      s.username !== sub.username &&
      (s.user as any)?.accountNumber === accountNumber &&
      accountNumber
  );

  const dfSub = submissions.find(
    (s) =>
      s.id !== sub.id &&
      s.username !== sub.username &&
      s.deviceFingerprint === sub.deviceFingerprint &&
      sub.deviceFingerprint &&
      sub.deviceFingerprint !== "server-side"
  );

  const [similarMatches, setSimilarMatches] = useState<any[]>([]);

  useEffect(() => {
    if (sub.proofType !== "text" && sub.id) {
      apiClient
        .get(`/admin/fraud/image-collision/${sub.id}`)
        .then((res: any) => {
          setSimilarMatches(res.matches || []);
        })
        .catch(console.error);
    } else {
      if (similarMatches.length > 0) setSimilarMatches([]);
    }
  }, [sub.id, sub.proofType]);

  const hasAlerts = dupSub || ipSub || devSub || bankSub || dfSub || similarMatches.length > 0;

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
            <p className="font-mono">
              <span className="text-zinc-550">Acc:</span> {accountNumber}
            </p>
            <p>
              <span className="text-zinc-550">Bank:</span> {bankName}
            </p>
            <p className="truncate">
              <span className="text-zinc-550">Name:</span> {accountName}
            </p>
          </div>
        </div>
      )}{" "}
      {hasAlerts && (
        <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Security Alerts</p>
          <div className="flex flex-col gap-1.5">
            {dupSub && (
              <div className="flex items-center justify-between gap-2 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <div className="leading-relaxed truncate">
                    Duplicate proof matching{" "}
                    <button
                      onClick={() => onCompareUser?.(dupSub.username)}
                      className="font-bold underline text-red-300 hover:text-red-200 cursor-pointer"
                    >
                      @{dupSub.username}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setCollision({ type: "image", value: String(sub.id) })}
                  title="Investigate duplicate proof collisions"
                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {similarMatches.map((match) => (
              <div
                key={match.submissionId}
                className="flex items-center justify-between gap-2 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <div className="leading-relaxed truncate">
                    Similar proof ({match.similarity}% similarity) matching{" "}
                    <button
                      onClick={() => onCompareUser?.(match.username)}
                      className="font-bold underline text-red-300 hover:text-red-200 cursor-pointer"
                    >
                      @{match.username}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setCollision({ type: "image", value: String(sub.id) })}
                  title="Investigate similar proof collisions"
                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {ipSub && (
              <div className="flex items-center justify-between gap-2 text-xs text-amber-400 bg-amber-955/20 border border-amber-900/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <div className="leading-relaxed truncate">
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
                <button
                  onClick={() => setCollision({ type: "ip", value: sub.ipAddress! })}
                  title="Investigate IP collisions"
                  className="p-1 rounded text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {devSub && (
              <div className="flex items-center justify-between gap-2 text-xs text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-500" />
                  <div className="leading-relaxed truncate">
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
                <button
                  onClick={() => setCollision({ type: "device", value: sub.deviceId! })}
                  title="Investigate Device ID collisions"
                  className="p-1 rounded text-yellow-500 hover:bg-yellow-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {dfSub && (
              <div className="flex items-center justify-between gap-2 text-xs text-yellow-500 bg-yellow-955/20 border border-yellow-900/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-500" />
                  <div className="leading-relaxed truncate">
                    Same Device Fingerprint as{" "}
                    <button
                      onClick={() => onCompareUser?.(dfSub.username)}
                      className="font-bold underline text-yellow-400 hover:text-yellow-350 cursor-pointer"
                    >
                      @{dfSub.username}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setCollision({ type: "device", value: sub.deviceFingerprint! })}
                  title="Investigate Device Fingerprint collisions"
                  className="p-1 rounded text-yellow-500 hover:bg-yellow-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {bankSub && (
              <div className="flex items-center justify-between gap-2 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <div className="leading-relaxed truncate">
                    Same Bank Account as{" "}
                    <button
                      onClick={() => onCompareUser?.(bankSub.username)}
                      className="font-bold underline text-red-300 hover:text-red-200 cursor-pointer"
                    >
                      @{bankSub.username}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setCollision({ type: "bank", value: accountNumber! })}
                  title="Investigate Bank Account collisions"
                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* DB fraud alerts — all types logged by the platform */}
      {sub.fraudAlerts && sub.fraudAlerts.length > 0 && (
        <FraudAlertsList
          alerts={sub.fraudAlerts}
          imageHash={sub.imageHash}
          ipAddress={sub.ipAddress}
          deviceId={sub.deviceId}
          deviceFingerprint={sub.deviceFingerprint}
          bankAccountNumber={(sub.user as any)?.accountNumber}
          onInvestigate={(type, value) => setCollision({ type, value })}
          onCompareUser={onCompareUser}
        />
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
      {collision && (
        <SubmissionCollisionModal
          type={collision.type}
          value={collision.value}
          onClose={() => setCollision(null)}
          onCompareUser={(username) => {
            onCompareUser?.(username);
            setCollision(null);
          }}
          currentUsername={sub.username}
        />
      )}
    </div>
  );
}
