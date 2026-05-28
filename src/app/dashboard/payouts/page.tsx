"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { usePayoutState } from "./hooks/usePayoutState";
import { usePayoutQueries } from "./hooks/usePayoutQueries";
import { usePayoutMutations } from "./hooks/usePayoutMutations";
import { PayoutRequestsTab } from "./components/PayoutRequestsTab";
import { PayoutHistoryTab } from "./components/PayoutHistoryTab";

export default function PayoutsPage() {
  const state = usePayoutState();
  const { data, isLoading, error, refetch } = usePayoutQueries();

  const mutations = usePayoutMutations({
    onSuccess: () => state.setActionError(null),
    onError: (err) => state.setActionError(err?.message || "Failed to update status"),
  });

  const claims = data?.data ?? [];
  const requests = claims.filter((c) => c.status === "in review");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-zinc-800 rounded w-72" />
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
        </div>
        <div className="border border-zinc-800/80 rounded-2xl bg-zinc-900/10 overflow-hidden divide-y divide-zinc-800/40">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-5 px-6 py-5">
              <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-36" />
                <div className="h-3.5 bg-zinc-800 rounded w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-sm font-bold text-zinc-200">Failed to load payout data</h3>
        <p className="text-zinc-550 text-xs max-w-sm">Please check your network connection and try again.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Payouts</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage user balances and payout claim requests</p>
        </div>

        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <button
            onClick={() => state.setTab("requests")}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              state.tab === "requests" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => state.setTab("history")}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              state.tab === "history" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {state.actionError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.actionError}</span>
        </div>
      )}

      {state.tab === "requests" ? (
        <PayoutRequestsTab
          requests={requests}
          onAction={(id, status) => mutations.mutate({ id, status })}
          disabled={mutations.isPending}
        />
      ) : (
        <PayoutHistoryTab
          claims={claims}
          dateFilter={state.dateFilter}
          setDateFilter={state.setDateFilter}
          customDate={state.customDate}
          setCustomDate={state.setCustomDate}
        />
      )}
    </div>
  );
}
