"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { UserCheck, AlertCircle, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  disabled: boolean;
  rating: number | null;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) {
    return <span className="text-zinc-600 text-xs italic">No rating</span>;
  }
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400 text-xs">
        {"★".repeat(rounded)}
        <span className="text-zinc-700">{"★".repeat(5 - rounded)}</span>
      </div>
      <span className="text-[11px] text-zinc-500 font-mono">({rating.toFixed(1)})</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-zinc-800/40 animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-2.5 w-16 bg-zinc-800/60 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-32 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 w-16 bg-zinc-800 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-7 w-24 bg-zinc-800 rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function MyUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error, refetch } = useQuery<UsersResponse>({
    queryKey: ["my-users", page, debouncedSearch],
    queryFn: () => apiClient.get(`/admin/my-users?page=${page}&search=${encodeURIComponent(debouncedSearch)}`) as any,
    enabled: !!currentUser,
  });

  const totalPages = data ? Math.ceil(data.total / (data.limit || 20)) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">My Users</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Users assigned to you
            {currentUser?.name ? ` — ${currentUser.name}` : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-zinc-300 font-semibold">Failed to load users</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Rating</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {isLoading ? (
                    <SkeletonRows />
                  ) : !data?.data?.length ? null : (
                    data.data.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-100 text-xs">{user.name}</p>
                              <p className="text-zinc-500 text-[11px]">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          {user.email || <span className="text-zinc-600 italic">No email</span>}
                        </td>
                        <td className="px-6 py-4">
                          <StarRating rating={user.rating} />
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.disabled ? "danger" : "success"} dot>
                            {user.disabled ? "Suspended" : "Active"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/dashboard/users?search=${encodeURIComponent(user.username)}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 transition-colors whitespace-nowrap"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {!isLoading && (!data?.data || data.data.length === 0) && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-zinc-500">
                <UserCheck className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">
                  {debouncedSearch ? "No users match your search" : "No users assigned to you yet"}
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && data && data.total > (data.limit || 20) && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60 bg-zinc-950/20">
                <p className="text-xs text-zinc-500">
                  Showing {(page - 1) * (data.limit || 20) + 1}–{Math.min(page * (data.limit || 20), data.total)} of{" "}
                  <span className="font-semibold text-zinc-300">{data.total}</span> users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-400 font-medium px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
