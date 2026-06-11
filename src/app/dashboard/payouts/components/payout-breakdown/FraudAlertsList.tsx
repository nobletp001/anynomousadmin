import React from "react";
import { ShieldAlert } from "lucide-react";
import { SeverityBadge } from "./Helpers";

interface FraudAlertsListProps {
  fraudAlerts: any[];
}

export function FraudAlertsList({ fraudAlerts }: FraudAlertsListProps) {
  const unresolvedAlerts = fraudAlerts.filter((f) => !f.resolved);
  if (unresolvedAlerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-red-400">
          Fraud Alerts ({unresolvedAlerts.length} unresolved)
        </p>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {unresolvedAlerts.map((f) => (
          <div key={f.id} className="px-3 py-2 rounded-lg bg-zinc-950/60">
            <div className="flex items-center gap-2 mb-0.5">
              <SeverityBadge severity={f.severity} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">{f.alertType.replace(/_/g, " ")}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
