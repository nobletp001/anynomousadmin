import React from "react";
import { CreditCard, ClipboardX } from "lucide-react";
import { formatDate } from "../utils";

interface UserDetailsHeaderProps {
  user: any;
}

export function UserDetailsHeader({ user }: UserDetailsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-xl font-bold text-purple-400">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-zinc-100">{user.name}</h2>
            {user.disabled && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/20">
                Disabled
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">
            @{user.username} · {user.email || "No email address registered"}
          </p>
          <p className="text-xs text-zinc-650 mt-1">Joined on {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* User Status Flags info */}
      <div className="flex items-center gap-4 text-xs">
        {user.withdrawalDisabled && (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-xl border border-amber-500/15">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Withdrawals Blocked</span>
          </div>
        )}
        {user.taskDisabled && (
          <div className="flex items-center gap-1 text-orange-400 bg-orange-500/5 px-2.5 py-1 rounded-xl border border-orange-500/15">
            <ClipboardX className="w-3.5 h-3.5" />
            <span>Tasks Blocked</span>
          </div>
        )}
      </div>
    </div>
  );
}
