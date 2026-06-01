import React from "react";
import { Eye, Activity, X } from "lucide-react";

interface MonitoredUser {
  id: number;
  name: string;
  username: string;
  email: string;
  disabled: boolean;
  rating: number;
  monitored: boolean;
}

interface MonitoredTabProps {
  monitored: MonitoredUser[];
  onViewAlerts: (username: string) => void;
  onRemoveFromWatch: (username: string) => void;
}

export function MonitoredTab({ monitored, onViewAlerts, onRemoveFromWatch }: MonitoredTabProps) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-zinc-800/60">
        <p className="text-xs text-zinc-500">{monitored.length} user(s) under active monitoring</p>
      </div>
      {monitored.length === 0 ? (
        <div className="py-16 text-center">
          <Eye className="w-10 h-10 text-zinc-750 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No users currently being monitored</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {monitored.map((user) => (
            <div key={user.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-200 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">@{user.username} · {user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onViewAlerts(user.username)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
                >
                  <Activity className="w-3 h-3" />
                  View Alerts
                </button>
                <button
                  onClick={() => onRemoveFromWatch(user.username)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
