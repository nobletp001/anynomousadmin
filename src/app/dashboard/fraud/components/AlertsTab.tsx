import React, { useState } from "react";
import { ShieldCheck, ShieldOff, ChevronUp, ChevronDown, Eye, CheckCircle } from "lucide-react";

interface FraudAlert {
  id: number;
  username: string;
  alertType: string;
  severity: string;
  description: string;
  metadata: string;
  resolved: boolean;
  resolvedBy: string | null;
  createdAt: string;
}

interface AlertsTabProps {
  alerts: FraudAlert[];
  showResolved: boolean;
  onToggleShowResolved: () => void;
  onWatchUser: (username: string) => void;
  onResolveAlert: (id: number) => void;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[severity] ?? map.medium}`}>
      {severity}
    </span>
  );
}

function alertTypeLabel(type: string) {
  const map: Record<string, string> = {
    bank_collision: "💳 Bank Collision",
    ip_collision: "🌐 IP Collision",
    device_collision: "📱 Device Collision",
    rapid_submission: "⚡ Rapid Submission",
    high_rejection_rate: "❌ High Rejection Rate",
  };
  return map[type] ?? type;
}

export function AlertsTab({
  alerts,
  showResolved,
  onToggleShowResolved,
  onWatchUser,
  onResolveAlert,
}: AlertsTabProps) {
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
        <p className="text-xs text-zinc-500 font-semibold">{alerts.length} {showResolved ? "total" : "unresolved"} alert(s)</p>
        <button
          onClick={onToggleShowResolved}
          className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          {showResolved ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          {showResolved ? "Hide Resolved" : "Show Resolved"}
        </button>
      </div>
      {alerts.length === 0 ? (
        <div className="py-16 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
          <p className="text-zinc-550 text-sm">No {showResolved ? "" : "unresolved "}fraud alerts</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {alerts.map((alert) => (
            <div key={alert.id} className={`px-5 py-4 ${alert.resolved ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full select-none">
                      {alertTypeLabel(alert.alertType)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">@{alert.username}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{alert.description}</p>
                  {alert.metadata && expandedAlert === alert.id && (
                    <pre className="mt-2 text-[10px] text-zinc-550 bg-zinc-950 rounded-lg p-3 border border-zinc-800/60 overflow-x-auto font-mono">
                      {JSON.stringify(JSON.parse(alert.metadata), null, 2)}
                    </pre>
                  )}
                  <p className="text-[10px] text-zinc-650 mt-1.5">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {alert.metadata && (
                    <button
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {expandedAlert === alert.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => onWatchUser(alert.username)}
                      className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer"
                      title="Watch this user"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      title="Mark as resolved"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
