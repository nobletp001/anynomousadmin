"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui";
import { AlertCircle, Users, ClipboardList, CheckSquare, CreditCard } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortWeek(w: string) {
  return new Date(w).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const chartTooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "12px",
  color: "#e4e4e7",
  fontSize: 12,
  fontWeight: 600,
};

const CARD_CLASS = "backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6";

function SkeletonCards() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-72 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
        ))}
      </div>
      <div className="h-72 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiClient.get("/admin/analytics") as any,
    staleTime: 5 * 60 * 1000,
  });

  const analytics = data?.data;

  const statCards = analytics
    ? [
        {
          label: "Total Users",
          value: analytics.totals.users.toLocaleString(),
          icon: Users,
          color: "purple",
          iconClass: "text-purple-400",
          bgClass: "bg-purple-500/10 border-purple-500/20",
          glowClass: "bg-purple-500/5",
          hoverClass: "hover:border-purple-500/30",
        },
        {
          label: "Total Tasks",
          value: analytics.totals.tasks.toLocaleString(),
          icon: ClipboardList,
          color: "indigo",
          iconClass: "text-indigo-400",
          bgClass: "bg-indigo-500/10 border-indigo-500/20",
          glowClass: "bg-indigo-500/5",
          hoverClass: "hover:border-indigo-500/30",
        },
        {
          label: "Task Completions",
          value: analytics.totals.submissions.toLocaleString(),
          icon: CheckSquare,
          color: "emerald",
          iconClass: "text-emerald-400",
          bgClass: "bg-emerald-500/10 border-emerald-500/20",
          glowClass: "bg-emerald-500/5",
          hoverClass: "hover:border-emerald-500/30",
        },
        {
          label: "Total Payouts Paid",
          value: formatAmount(analytics.totals.payoutsPaid),
          icon: CreditCard,
          color: "amber",
          iconClass: "text-amber-400",
          bgClass: "bg-amber-500/10 border-amber-500/20",
          glowClass: "bg-amber-500/5",
          hoverClass: "hover:border-amber-500/30",
        },
      ]
    : [];

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
          <p className="text-zinc-500 text-sm">There was a problem fetching platform data.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        analytics && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`${CARD_CLASS} relative overflow-hidden group transition-all duration-300 ${card.hoverClass}`}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl transition-all duration-300 ${card.glowClass} group-hover:opacity-150`}
                  />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
                      {card.label}
                    </span>
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bgClass}`}>
                      <card.icon className={`w-4.5 h-4.5 ${card.iconClass}`} />
                    </div>
                  </div>
                  <span className="text-2xl font-extrabold text-zinc-100 tracking-tight block truncate">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Signup + Completions Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Signups */}
              <div className={CARD_CLASS}>
                <h2 className="text-sm font-bold text-zinc-200 mb-1">User Signups</h2>
                <p className="text-xs text-zinc-500 mb-5">Last 30 days</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.userSignups} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={(d: unknown) => formatShortDate(d as string)}
                      formatter={(value: unknown) => [value as number, "Signups"]}
                      cursor={{ stroke: "#7c3aed", strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#7c3aed", stroke: "#3f3f46", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Task Completions */}
              <div className={CARD_CLASS}>
                <h2 className="text-sm font-bold text-zinc-200 mb-1">Task Completions</h2>
                <p className="text-xs text-zinc-500 mb-5">Last 30 days</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.taskCompletions} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={(d: unknown) => formatShortDate(d as string)}
                      formatter={(value: unknown) => [value as number, "Completions"]}
                      cursor={{ fill: "rgba(99,102,241,0.06)" }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payout Volume */}
            <div className={CARD_CLASS}>
              <h2 className="text-sm font-bold text-zinc-200 mb-1">Payout Volume</h2>
              <p className="text-xs text-zinc-500 mb-5">Last 8 weeks — weekly totals</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.payoutVolume} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={formatShortWeek}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={(w: unknown) => formatShortWeek(w as string)}
                    formatter={(value: unknown) => [formatAmount(value as number), "Payouts"]}
                    cursor={{ stroke: "#7c3aed", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#payoutGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#7c3aed", stroke: "#3f3f46", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      )}
    </div>
  );
}
