import React from "react";
import { AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { PayoutClaim } from "../types";
import { fmt } from "../utils";
import { BankCard } from "./BankCard";

interface PayoutRequestRowProps {
  r: PayoutClaim;
  onAction: (id: number, status: "paid" | "rejected") => void;
  onViewBreakdown: (claim: PayoutClaim) => void;
  disabled: boolean;
}

export function PayoutRequestRow({ r, onAction, onViewBreakdown, disabled }: PayoutRequestRowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-zinc-800/10 transition-colors">
      <div className="flex items-center gap-3 shrink-0 md:w-56">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-extrabold text-purple-400 shrink-0">
          {r.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">@{r.username}</p>
          <p className="text-base font-black text-emerald-400 leading-tight mt-0.5">{fmt(r.amount)}</p>
          <p className="text-[10px] text-zinc-650 mt-1">
            Requested:{" "}
            {new Date(r.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {r.bankDetail ? (
          <BankCard bd={r.bankDetail} />
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/20">
            <AlertCircle className="w-4 h-4 text-amber-500/70 shrink-0" />
            <p className="text-xs text-zinc-500">No bank details linked yet</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0 md:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewBreakdown(r)}
          disabled={disabled}
          className="border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500 hover:text-white"
        >
          <Search className="w-3.5 h-3.5 mr-1.5" />
          Review
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction(r.id, "paid")}
          disabled={disabled}
          className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
        >
          Pay
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction(r.id, "rejected")}
          disabled={disabled}
          className="border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
