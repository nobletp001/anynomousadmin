import React from "react";
import { Building2, Phone } from "lucide-react";
import { BankDetail } from "../types";
import { CopyBtn } from "./CopyBtn";

interface BankCardProps {
  bd: BankDetail;
}

export function BankCard({ bd }: BankCardProps) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 items-center px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        {bd.bankName}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-mono font-bold text-zinc-100 tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
          {bd.accountNumber}
        </span>
        <CopyBtn text={bd.accountNumber} />
        <span className="text-zinc-700 px-0.5">|</span>
        <span className="text-zinc-405 truncate max-w-40 font-medium">{bd.accountName}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        {bd.whatsappNumber}
        <CopyBtn text={bd.whatsappNumber} />
      </div>
    </div>
  );
}
