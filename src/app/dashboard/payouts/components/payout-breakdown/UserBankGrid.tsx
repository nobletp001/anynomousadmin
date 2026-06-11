import React from "react";
import Link from "next/link";

interface UserBankGridProps {
  user: any;
  bankDetails: any;
  username: string;
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function UserBankGrid({ user, bankDetails, username }: UserBankGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">User</p>
        <p className="text-sm font-bold text-zinc-100">{user?.name ?? username}</p>
        <Link
          href={`/dashboard/users/${username}`}
          className="text-xs text-zinc-400 hover:text-purple-400 hover:underline cursor-pointer"
        >
          @{username}
        </Link>
        {user?.disabled && (
          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-400 mt-1">
            Disabled
          </span>
        )}
        {(user?.violationDebt ?? 0) > 0 && (
          <p className="text-[10px] text-amber-400 font-semibold mt-1">Violation debt: {fmt2(user.violationDebt)}</p>
        )}
      </div>
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bank Details</p>
        {bankDetails ? (
          <>
            <p className="text-sm font-bold text-zinc-100">{bankDetails.accountName}</p>
            <p className="text-xs text-zinc-400">{bankDetails.accountNumber}</p>
            <p className="text-xs text-zinc-500">{bankDetails.bankName}</p>
          </>
        ) : (
          <p className="text-xs text-amber-400">No bank details found</p>
        )}
      </div>
    </div>
  );
}
