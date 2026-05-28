import React from "react";
import { AlertCircle, CircleCheck } from "lucide-react";
import { PayoutClaim } from "../types";
import { fmt } from "../utils";
import { BankCard } from "./BankCard";

interface PayoutHistoryRowProps {
  c: PayoutClaim;
}

export function PayoutHistoryRow({ c }: PayoutHistoryRowProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors">
      <div className="flex items-center gap-3 shrink-0 lg:w-56">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
          {c.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">@{c.username}</p>
          <p className="text-base font-black text-emerald-400 leading-tight mt-0.5">{fmt(c.amount)}</p>
          {c.paidAt && (
            <p className="text-[10px] text-zinc-600 mt-1">
              Paid:{" "}
              {new Date(c.paidAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {c.bankDetail ? (
          <BankCard bd={c.bankDetail} />
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
            <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
            <p className="text-xs text-zinc-500 font-medium">No bank details recorded</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 lg:justify-end">
        <div className="text-left lg:text-right">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
            <CircleCheck className="w-3.5 h-3.5" />
            Paid
          </span>
          {c.paidBy ? (
            <p className="text-[10px] text-zinc-500 mt-1.5 font-medium leading-none">
              by <span className="text-zinc-355 font-bold">@{c.paidBy}</span> ({c.paidByRole || "Admin"})
            </p>
          ) : (
            <p className="text-[10px] text-zinc-600 mt-1.5 font-medium leading-none">by unknown admin</p>
          )}
        </div>
      </div>
    </div>
  );
}
