"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import {
  Search,
  AlertCircle,
  MessageCircle,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  UserMinus,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui";
import { fmt } from "../../payouts/utils";

interface ReferrerDetails {
  username: string;
  name: string | null;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
}

interface UserTrackingItem {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
  lastLogin: string | null;
  lastSubmission: string | null;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  referrer: ReferrerDetails | null;
}

export function UserTrackingTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: UserTrackingItem[] }>({
    queryKey: ["admin-users-tracking"],
    queryFn: () => apiClient.get("/admin/users/tracking") as any,
  });

  const trackingData = data?.data ?? [];

  const filteredUsers = trackingData.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase().trim()) ||
      u.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      (u.referrer?.username ?? "").toLowerCase().includes(search.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const cleanPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0") && cleaned.length === 11) {
      cleaned = "234" + cleaned.substring(1);
    }
    return cleaned;
  };

  const getWhatsAppMessageAndLink = (user: UserTrackingItem, isForReferrer = false) => {
    const phone = isForReferrer ? user.referrer?.phone : user.phone;
    if (!phone) return null;

    let text = "";
    if (isForReferrer) {
      // Message to the referrer about their referred user
      if (user.isActive) {
        text = `Hello, I can see your referral @${user.username} is very active on PayFluence! Your reward is coming and you are both noted for opportunities.`;
      } else {
        if (!user.lastSubmission) {
          text = `Hello, why is your referral @${user.username} not performing tasks on PayFluence? Please reach out to them.`;
        } else {
          text = `Hello, why is your referral @${user.username} not available/active on PayFluence? Please remind them to log in.`;
        }
      }
    } else {
      // Message to the user directly
      if (user.isActive) {
        text = `Hello ${user.name}, I can see you are very active. Your reward is coming and your profile is noted. When opportunity comes, we are going to remember you!`;
      } else {
        if (!user.lastSubmission) {
          text = `Hello ${user.name}, why are you not performing tasks on PayFluence?`;
        } else {
          text = `Hello ${user.name}, why are you not available/active on PayFluence?`;
        }
      }
    }

    const cleanPhone = cleanPhoneForWhatsApp(phone);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-900/60 rounded-xl w-72" />
        <div className="h-96 bg-zinc-900/30 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-sm font-bold text-zinc-200 font-extrabold">Failed to load tracking data</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl shrink-0">
          {[
            { val: "all", label: "All Users" },
            { val: "active", label: "Active" },
            { val: "inactive", label: "Inactive" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => {
                setStatusFilter(f.val as any);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.val
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-zinc-405 hover:text-zinc-250"
              }`}
            >
              {f.label} ({trackingData.filter(u => f.val === "all" || (f.val === "active" && u.isActive) || (f.val === "inactive" && !u.isActive)).length})
            </button>
          ))}
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search username, name, referrer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-105 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 py-24 text-center text-zinc-500">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <UserMinus className="w-5 h-5 opacity-40" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-300">No tracked users found</p>
              <p className="text-xs text-zinc-500 mt-1">No user records matched your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-950/20">
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">User Details</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Last Activity</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Bank Account</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Referrer Details</th>
                  <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">Referrer Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {paginatedUsers.map((u) => {
                  const userWaLink = getWhatsAppMessageAndLink(u, false);
                  const refWaLink = getWhatsAppMessageAndLink(u, true);

                  return (
                    <tr key={u.username} className="hover:bg-zinc-800/10 transition-colors align-top">
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                            <UserMinus className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* User Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-bold text-zinc-100">{u.name}</p>
                          <p className="text-xs text-purple-400 mt-0.5">@{u.username}</p>
                          {u.phone ? (
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-xs text-zinc-400 font-medium">{u.phone}</span>
                              {userWaLink && (
                                <a
                                  href={userWaLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact User on WhatsApp"
                                  className="p-1 rounded bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 transition-colors shrink-0 flex items-center justify-center"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 block mt-2 italic">No number</span>
                          )}
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5 text-xs text-zinc-350">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>Login: <span className="font-semibold text-zinc-200">{formatDateTime(u.lastLogin)}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>Task: <span className="font-semibold text-zinc-200">{formatDateTime(u.lastSubmission)}</span></span>
                          </div>
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.bankName ? (
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{u.bankName}</p>
                            <p className="text-[11px] font-mono tracking-wider text-zinc-400 mt-1 select-all">{u.accountNumber}</p>
                            <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-40 font-medium">{u.accountName}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-550 italic">No bank linked</span>
                        )}
                      </td>

                      {/* Referrer Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.referrer ? (
                          <div>
                            <p className="text-sm font-bold text-zinc-150">{u.referrer.name || "N/A"}</p>
                            <p className="text-xs text-purple-400/80 mt-0.5">@{u.referrer.username}</p>
                            {u.referrer.phone ? (
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-xs text-zinc-400 font-medium">{u.referrer.phone}</span>
                                {refWaLink && (
                                  <a
                                    href={refWaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Contact Referrer about this referral"
                                    className="p-1 rounded bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 transition-colors shrink-0 flex items-center justify-center"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-500 block mt-2 italic">No number</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-550 italic">Organic signup</span>
                        )}
                      </td>

                      {/* Referrer Bank */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.referrer && u.referrer.bankName ? (
                          <div>
                            <p className="text-xs font-bold text-zinc-205">{u.referrer.bankName}</p>
                            <p className="text-[11px] font-mono tracking-wider text-zinc-400 mt-1 select-all">{u.referrer.accountNumber}</p>
                            <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-40 font-medium">{u.referrer.accountName}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-550 italic">No bank linked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
