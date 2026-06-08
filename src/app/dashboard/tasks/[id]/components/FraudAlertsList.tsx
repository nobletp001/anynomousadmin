"use client";

import React, { useState } from "react";
import { ShieldAlert, ChevronDown, ChevronUp, ScanSearch, CheckCircle } from "lucide-react";
import { FraudAlert } from "../types";
import { apiClient } from "@/services/api-client";

interface FraudAlertsListProps {
  alerts: FraudAlert[];
  imageHash?: string | null;
  ipAddress?: string | null;
  deviceId?: string | null;
  deviceFingerprint?: string | null;
  bankAccountNumber?: string | null;
  onInvestigate: (type: string, value: string) => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40",
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  bank_collision: "💳 Bank Collision",
  ip_collision: "🌐 IP Collision",
  device_collision: "📱 Device Collision",
  rapid_submission: "⚡ Rapid Submission",
  high_rejection_rate: "❌ High Rejection Rate",
  suspicious_pattern: "🔍 Suspicious Pattern",
  duplicate_account: "👥 Duplicate Account",
};

// Derive investigate action from alert type + available values on the submission
function getInvestigateAction(
  alert: FraudAlert,
  imageHash?: string | null,
  ipAddress?: string | null,
  deviceId?: string | null,
  deviceFingerprint?: string | null,
  bankAccountNumber?: string | null
): { type: string; value: string } | null {
  if (alert.alertType === "image_collision" || (alert.alertType === "suspicious_pattern" && imageHash)) {
    if (imageHash) return { type: "image", value: imageHash };
  }
  if (alert.alertType === "ip_collision" && ipAddress) return { type: "ip", value: ipAddress };
  if (alert.alertType === "device_collision" && (deviceId || deviceFingerprint)) {
    return { type: "device", value: deviceId || deviceFingerprint! };
  }
  if (alert.alertType === "bank_collision" && bankAccountNumber) return { type: "bank", value: bankAccountNumber };
  return null;
}

export function FraudAlertsList({
  alerts,
  imageHash,
  ipAddress,
  deviceId,
  deviceFingerprint,
  bankAccountNumber,
  onInvestigate,
}: FraudAlertsListProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());

  const visible = alerts.filter((a) => !resolvedIds.has(a.id));
  if (visible.length === 0) return null;

  const handleResolve = async (id: number) => {
    setResolving(id);
    try {
      await apiClient.patch(`/admin/fraud/alerts/${id}/resolve`);
      setResolvedIds((prev) => new Set([...prev, id]));
    } catch {
      // silently ignore — alert stays visible
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
      <p className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
        <ShieldAlert className="w-3 h-3 text-red-400" />
        Fraud Alerts ({visible.length})
      </p>

      <div className="flex flex-col gap-1.5">
        {visible.map((alert) => {
          const investigateAction = getInvestigateAction(
            alert,
            imageHash,
            ipAddress,
            deviceId,
            deviceFingerprint,
            bankAccountNumber
          );
          const isExpanded = expanded === alert.id;

          return (
            <div key={alert.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.medium}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                      {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{alert.description}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {alert.metadata && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : alert.id)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                  {investigateAction && (
                    <button
                      onClick={() => onInvestigate(investigateAction.type, investigateAction.value)}
                      title="See all users with same collision value"
                      className="p-1 rounded text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer"
                    >
                      <ScanSearch className="w-3 h-3" />
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolving === alert.id}
                      title="Mark resolved"
                      className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && alert.metadata && (
                <pre className="text-[10px] text-zinc-500 bg-zinc-950 rounded p-2 border border-zinc-800 overflow-x-auto font-mono">
                  {JSON.stringify(JSON.parse(alert.metadata), null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
