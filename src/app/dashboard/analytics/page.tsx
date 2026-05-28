"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { SkeletonCards } from "./components/SkeletonCards";
import { StatCards } from "./components/StatCards";
import { UserSignupsChart } from "./components/UserSignupsChart";
import { TaskCompletionsChart } from "./components/TaskCompletionsChart";
import { PayoutVolumeChart } from "./components/PayoutVolumeChart";

interface AnalyticsData {
  userSignups: Array<{ date: string; count: number }>;
  taskCompletions: Array<{ date: string; count: number }>;
  payoutVolume: Array<{ week: string; amount: number }>;
  totals: { users: number; tasks: number; submissions: number; payoutsPaid: number };
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export default function AnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiClient.get("/admin/analytics") as any,
    staleTime: 5 * 60 * 1000,
  });

  const analytics = data?.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Platform overview and trends</p>
        </div>
        {!isLoading && (
          <Button variant="outline" size="md" onClick={() => refetch()}>
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonCards />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-zinc-300 font-semibold">Failed to load analytics</p>
          <p className="text-zinc-505 text-sm">There was a problem fetching platform data.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        analytics && (
          <>
            <StatCards totals={analytics.totals} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserSignupsChart data={analytics.userSignups} />
              <TaskCompletionsChart data={analytics.taskCompletions} />
            </div>

            <PayoutVolumeChart data={analytics.payoutVolume} />
          </>
        )
      )}
    </div>
  );
}
