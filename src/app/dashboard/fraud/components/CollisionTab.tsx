import React from "react";
import { CreditCard, Wifi, Smartphone, Eye, ScanSearch, ShieldCheck } from "lucide-react";

interface CollisionRow {
  account_number?: string;
  bank_name?: string;
  ip_address?: string;
  device_id?: string;
  usernames: string[];
  user_count: number;
  submission_count?: number;
}

interface CollisionTabProps {
  type: "bank" | "ip" | "device";
  collisions: CollisionRow[];
  onInvestigate: (value: string) => void;
  onWatchUser: (username: string) => void;
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

export function CollisionTab({ type, collisions, onInvestigate, onWatchUser }: CollisionTabProps) {
  const getCollisionIcon = () => {
    if (type === "bank") return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
    if (type === "ip") return <Wifi className="w-3.5 h-3.5 text-orange-400" />;
    return <Smartphone className="w-3.5 h-3.5 text-yellow-400" />;
  };

  const getCollisionLabel = (row: CollisionRow) => {
    if (type === "bank") return row.account_number;
    if (type === "ip") return row.ip_address;
    return row.device_id ? `${row.device_id.substring(0, 24)}...` : "N/A";
  };

  const getSubLabel = (row: CollisionRow) => {
    if (type === "bank") return row.bank_name;
    if (type === "ip") return `${row.user_count} accounts · ${row.submission_count ?? "?"} submissions`;
    return `${row.user_count} accounts · ${row.submission_count ?? "?"} submissions`;
  };

  return (
    <div>
      <div className="px-5 py-3 border-b border-zinc-800/60 select-none">
        <p className="text-xs text-zinc-500">
          {collisions.length} shared {type === "bank" ? "bank account(s)" : type === "ip" ? "IP address(es)" : "device ID(s)"} detected
        </p>
      </div>

      {collisions.length === 0 ? (
        <div className="py-16 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No shared {type === "bank" ? "bank accounts" : type === "ip" ? "IP addresses" : "device IDs"} detected</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {collisions.map((row, i) => {
            const collisionVal = type === "bank" ? row.account_number : type === "ip" ? row.ip_address : row.device_id;
            return (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getCollisionIcon()}
                      <span className="text-sm font-bold text-zinc-200 font-mono">{getCollisionLabel(row)}</span>
                      {type === "bank" && <span className="text-xs text-zinc-550 font-medium">{getSubLabel(row)}</span>}
                    </div>
                    {type !== "bank" && <p className="text-xs text-zinc-400 font-medium mb-1.5">{getSubLabel(row)}</p>}
                    {type === "bank" && <p className="text-xs text-red-400 font-semibold mb-2">Shared by {row.user_count} accounts</p>}
                    
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {(Array.isArray(row.usernames) ? row.usernames : []).map((u) => (
                        <div key={u} className="flex items-center gap-1">
                          <span className="bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">@{u}</span>
                          <button
                            onClick={() => onWatchUser(u)}
                            title={`Watch @${u}`}
                            className="text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {type === "bank" ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase select-none">
                        CRITICAL
                      </span>
                    ) : (
                      <SeverityBadge severity={Number(row.user_count) >= 3 ? "critical" : "high"} />
                    )}
                    <button
                      onClick={() => collisionVal && onInvestigate(collisionVal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                    >
                      <ScanSearch className="w-3.5 h-3.5" />
                      Investigate Group
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
