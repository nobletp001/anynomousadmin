"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import {
  Wallet,
  Clock,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Search,
  Building2,
  Phone,
  ArrowUpDown,
  Coins,
} from "lucide-react";
import { BankCard } from "../payouts/components/BankCard";
import { fmt } from "../payouts/utils";
import { Button } from "@/components/ui";

interface BankDetail {
  accountName: string;
  accountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

interface RedeemerUser {
  username: string;
  availableBalance: number;
  pendingAmount: number;
  pendingCount: number;
  totalPaid: number;
  taskEarnings: number;
  taskCount: number;
  referralEarnings: number;
  totalReferrals: number;
  referredActiveCount: number;
  inReviewAmount: number;
  bankDetail: BankDetail | null;
}

interface RedeemersData {
  totalReadyPayout: number;
  totalPendingClear: number;
  totalClaimsInReview: number;
  totalPaidPayouts: number;
  users: RedeemerUser[];
}

export default function BalancesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: RedeemersData }>({
    queryKey: ["admin-redeemers"],
    queryFn: () => apiClient.get("/admin/redeemers") as any,
  });

  const redeemersData = data?.data;

  const filteredUsers = (redeemersData?.users ?? []).filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-zinc-800 rounded w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900/60 rounded-2xl border border-zinc-800/80" />
          ))}
        </div>
        <div className="h-96 bg-zinc-900/30 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-sm font-bold text-zinc-200 font-extrabold">Failed to load balances data</h3>
        <p className="text-zinc-550 text-xs max-w-sm">Please check your network connection and try again.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  const totalReadyPayout = redeemersData?.totalReadyPayout ?? 0;
  const totalPendingClear = redeemersData?.totalPendingClear ?? 0;
  const totalClaimsInReview = redeemersData?.totalClaimsInReview ?? 0;
  const totalPaidPayouts = redeemersData?.totalPaidPayouts ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
            <Coins className="w-8 h-8 text-purple-500" />
            Balances
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track user account balances, payouts, task completions, and referral stats
          </p>
        </div>
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-105 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Ready Payout",
            val: fmt(totalReadyPayout),
            sub: "Total user available balances",
            icon: <Wallet className="w-4 h-4" />,
            color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            valColor: "text-emerald-450",
          },
          {
            label: "Total Pending Clear",
            val: fmt(totalPendingClear),
            sub: "Earnings from pending tasks",
            icon: <Clock className="w-4 h-4" />,
            color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            valColor: "text-amber-450",
          },
          {
            label: "Claims in Review",
            val: fmt(totalClaimsInReview),
            sub: "Submitted claims in verification",
            icon: <ClipboardList className="w-4 h-4" />,
            color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            valColor: "text-purple-450",
          },
          {
            label: "Total Paid Out",
            val: fmt(totalPaidPayouts),
            sub: "Accumulated paid settlements",
            icon: <CheckCircle className="w-4 h-4" />,
            color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            valColor: "text-blue-450",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md hover:border-zinc-800 transition duration-200"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">{c.label}</p>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${c.color}`}>
                {c.icon}
              </div>
            </div>
            <p className={`text-2xl font-black mt-2 ${c.valColor}`}>{c.val}</p>
            <p className="text-[9px] text-zinc-550 mt-1 font-semibold">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Table Panel */}
      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Wallet className="w-5 h-5 opacity-40" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-300">No balance records found</p>
              <p className="text-xs text-zinc-500 mt-1">No user balances or financial activity matched your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-805 bg-zinc-950/20">
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Ready Payout</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Pending Clear</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Paid Out</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Task Earnings</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Referrals</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Bank Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {paginatedUsers.map((u) => (
                  <tr key={u.username} className="hover:bg-zinc-800/10 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-100">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Ready Payout */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-sm font-black text-emerald-400">{fmt(u.availableBalance)}</p>
                      {u.inReviewAmount > 0 && (
                        <p className="text-[9px] text-purple-400/80 font-medium mt-0.5">
                          {fmt(u.inReviewAmount)} in review
                        </p>
                      )}
                    </td>

                    {/* Pending Clear */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-sm font-bold text-amber-450">{fmt(u.pendingAmount)}</p>
                      {u.pendingCount > 0 && (
                        <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                          {u.pendingCount} pending {u.pendingCount === 1 ? "task" : "tasks"}
                        </p>
                      )}
                    </td>

                    {/* Paid Out */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-sm font-bold text-blue-450">{fmt(u.totalPaid)}</p>
                    </td>

                    {/* Task Earnings */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-zinc-200">{fmt(u.taskEarnings)}</p>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                        {u.taskCount} approved {u.taskCount === 1 ? "task" : "tasks"}
                      </p>
                    </td>

                    {/* Referrals */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-purple-400">{fmt(u.referralEarnings)}</p>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                        {u.totalReferrals} referred ({u.referredActiveCount} active)
                      </p>
                    </td>

                    {/* Bank Details */}
                    <td className="px-6 py-4.5 min-w-[280px]">
                      {u.bankDetail ? (
                        <div className="scale-95 origin-left">
                          <BankCard bd={u.bankDetail} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-800/80 bg-zinc-950/20 w-fit">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                          <p className="text-[10px] text-zinc-500 font-medium">No bank linked yet</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/40 bg-zinc-900/10">
            <p className="text-xs text-zinc-500 font-semibold">
              Showing <span className="text-zinc-300">{(page - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-zinc-300">
                {Math.min(page * itemsPerPage, filteredUsers.length)}
              </span>{" "}
              of <span className="text-zinc-300">{filteredUsers.length}</span> users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
