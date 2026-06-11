"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { useUsersQueries } from "./hooks/useUsersQueries";
import { useUsersMutations } from "./hooks/useUsersMutations";
import { useUsersState } from "./hooks/useUsersState";
import { TopPerformers } from "./components/TopPerformers";
import { UsersTable } from "./components/UsersTable";
import { GWVerifiedTable } from "./components/GWVerifiedTable";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserTrackingTab } from "./components/UserTrackingTab";
import { ShieldOff, CreditCard, ClipboardX } from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const state = useUsersState();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "tracking" | "gw">("all");

  const { usersQuery, gwQuery, detailQuery, topUsersQuery } = useUsersQueries(
    state.page,
    state.debouncedSearch,
    state.selectedUser,
    activeTab
  );
  const { updateFlags } = useUsersMutations(state.page);

  const handleSendAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.selectedUser) return;
    if (!state.actionMessage.trim()) {
      state.setActionError("Message is required");
      return;
    }
    const amountVal = state.actionAmount ? parseFloat(state.actionAmount) : 0;
    if (
      (state.actionType === "deducted" || state.actionType === "additional") &&
      (isNaN(amountVal) || amountVal <= 0)
    ) {
      state.setActionError("A valid positive amount is required for deductions or additions.");
      return;
    }

    try {
      state.setActionSubmitting(true);
      state.setActionError("");
      state.setActionSuccess("");
      await apiClient.post(`/admin/users/${state.selectedUser}/actions`, {
        actionType: state.actionType,
        message: state.actionMessage.trim(),
        amount: amountVal,
      });
      state.setActionSuccess("Action recorded successfully!");
      state.setActionMessage("");
      state.setActionAmount("");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", state.selectedUser] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gw-users"] });
    } catch (err: any) {
      console.error(err);
      state.setActionError(err.response?.data?.error || err.message || "Failed to submit action");
    } finally {
      state.setActionSubmitting(false);
    }
  };

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    state.setCopiedId(refId);
    setTimeout(() => state.setCopiedId(null), 2000);
  };

  const showAll = activeTab === "all";
  const showGW = activeTab === "gw";

  const activeQueryData = showAll ? usersQuery.data : showGW ? gwQuery.data : null;
  const totalPages = activeQueryData ? Math.ceil(activeQueryData.total / activeQueryData.limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Users</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {activeTab === "all"
              ? "All registered accounts — newest first"
              : activeTab === "gw"
                ? "Google & WhatsApp verified accounts — newest first"
                : "Track active/inactive user engagement and referrals"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("all");
                state.setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => {
                setActiveTab("gw");
                state.setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "gw" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
              }`}
            >
              GW Verified
            </button>
            <button
              onClick={() => {
                setActiveTab("tracking");
                state.setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "tracking" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-405 hover:text-zinc-250"
              }`}
            >
              User Tracking
            </button>
          </div>

          {(activeTab === "all" || activeTab === "gw") && (
            <div className="w-72">
              <input
                type="text"
                placeholder="Search by name, @username, or email..."
                value={state.search}
                onChange={(e) => state.setSearch(e.target.value)}
                className={
                  "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 " +
                  "text-sm text-zinc-105 placeholder:text-zinc-500 focus:outline-none " +
                  "focus:border-purple-500/50 transition-colors"
                }
              />
            </div>
          )}
        </div>
      </div>

      {activeTab === "tracking" ? (
        <UserTrackingTab />
      ) : (
        <>
          {activeTab === "all" && (
            <TopPerformers
              topPerformers={topUsersQuery.data?.data || []}
              onSelectUser={(username) => router.push(`/dashboard/users/${username}`)}
            />
          )}

          {activeTab === "all" ? (
            <UsersTable
              users={usersQuery.data?.data || []}
              onSelectUser={(username) => router.push(`/dashboard/users/${username}`)}
              onUpdateFlags={(id, flags) => updateFlags.mutate({ id, flags })}
              page={state.page}
              setPage={state.setPage}
              totalPages={totalPages}
              totalUsers={usersQuery.data?.total || 0}
            />
          ) : (
            <GWVerifiedTable
              users={gwQuery.data?.data || []}
              onSelectUser={(username) => router.push(`/dashboard/users/${username}`)}
              onUpdateFlags={(id, flags) => updateFlags.mutate({ id, flags })}
              page={state.page}
              setPage={state.setPage}
              totalPages={totalPages}
              totalUsers={gwQuery.data?.total || 0}
            />
          )}

          <div className="flex items-center gap-6 text-[11px] text-zinc-650 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <ShieldOff className="w-3 h-3" /> Account disabled (all blocked)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <CreditCard className="w-3 h-3" /> Withdrawal blocked
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <ClipboardX className="w-3 h-3" /> Tasks blocked
            </div>
          </div>
        </>
      )}

      {state.selectedUser && (
        <UserDetailModal
          selectedUser={state.selectedUser}
          onClose={() => state.setSelectedUser(null)}
          userDetail={detailQuery.data}
          isLoadingDetail={detailQuery.isLoading}
          actionType={state.actionType}
          setActionType={state.setActionType}
          actionAmount={state.actionAmount}
          setActionAmount={state.setActionAmount}
          actionMessage={state.actionMessage}
          setActionMessage={state.setActionMessage}
          actionError={state.actionError}
          actionSuccess={state.actionSuccess}
          actionSubmitting={state.actionSubmitting}
          handleSendAction={handleSendAction}
          copiedId={state.copiedId}
          handleCopyRef={handleCopyRef}
          onActionReverseSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-user-detail", state.selectedUser] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          }}
        />
      )}
    </div>
  );
}
