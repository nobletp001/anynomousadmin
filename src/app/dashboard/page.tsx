"use client";

import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui";
import { Users, MessageSquare, GitMerge, AlertCircle, RefreshCw, WalletCards } from "lucide-react";
import { StatsCard } from "./components/StatsCard";

interface StatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    totalMessages: number;
    totalReferrals: number;
  };
}

interface BalanceCacheRefreshResponse {
  success: boolean;
  data: {
    message: string;
    deleted: number;
    cacheAvailable: boolean;
  };
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<StatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/stats");
      return response as unknown as StatsResponse;
    },
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const refreshBalanceCache = useMutation<BalanceCacheRefreshResponse>({
    mutationFn: async () => {
      const response = await apiClient.post("/admin/cache/balances/refresh");
      return response as unknown as BalanceCacheRefreshResponse;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time statistics and activity hub</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => refreshBalanceCache.mutate()}
            disabled={refreshBalanceCache.isPending}
            leftIcon={<WalletCards className={`w-4 h-4 ${refreshBalanceCache.isPending ? "animate-pulse" : ""}`} />}
          >
            Refresh Wallet Cache
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {refreshBalanceCache.isSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Wallet cache refreshed. Cleared {refreshBalanceCache.data.data.deleted} balance cache key
          {refreshBalanceCache.data.data.deleted === 1 ? "" : "s"}.
        </div>
      )}

      {refreshBalanceCache.isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Failed to refresh wallet cache. This action requires super-admin access.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center max-w-xl mx-auto gap-3">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h3 className="text-lg font-bold text-zinc-100">Failed to load statistics</h3>
          <p className="text-sm text-zinc-400">{error.message || "Please check your connection."}</p>
          <Button variant="danger" size="md" onClick={() => refetch()} className="mt-2">
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            index={0}
            label="Total Users"
            value={data?.data.totalUsers}
            icon={Users}
            color="purple"
            subtext="Active platform members"
            showTrending
          />

          <StatsCard
            index={1}
            label="Messages Sent"
            value={data?.data.totalMessages}
            icon={MessageSquare}
            color="blue"
            subtext="Anonymous logs recorded"
          />

          <StatsCard
            index={2}
            label="Referrals"
            value={data?.data.totalReferrals}
            icon={GitMerge}
            color="emerald"
            subtext="User invites completed"
          />
        </div>
      )}
    </div>
  );
}
