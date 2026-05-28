"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui";
import { Users, MessageSquare, GitMerge, AlertCircle, RefreshCw } from "lucide-react";
import { StatsCard } from "./components/StatsCard";

interface StatsResponse {
  success: boolean;
  stats: {
    totalUsers: number;
    totalMessages: number;
    totalReferrals: number;
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time statistics and activity hub</p>
        </div>
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
            value={data?.stats.totalUsers}
            icon={Users}
            color="purple"
            subtext="Active platform members"
            showTrending
          />

          <StatsCard
            index={1}
            label="Messages Sent"
            value={data?.stats.totalMessages}
            icon={MessageSquare}
            color="blue"
            subtext="Anonymous logs recorded"
          />

          <StatsCard
            index={2}
            label="Referrals"
            value={data?.stats.totalReferrals}
            icon={GitMerge}
            color="emerald"
            subtext="User invites completed"
          />
        </div>
      )}
    </div>
  );
}
