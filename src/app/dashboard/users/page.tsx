"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { useUsersQueries } from "./hooks/useUsersQueries";
import { useUsersMutations } from "./hooks/useUsersMutations";
import { useUsersState } from "./hooks/useUsersState";
import { TopPerformers } from "./components/TopPerformers";
import { UsersTable } from "./components/UsersTable";
import { UserDetailModal } from "./components/UserDetailModal";
import { ShieldOff, CreditCard, ClipboardX } from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const state = useUsersState();
  const { usersQuery, detailQuery, topUsersQuery } = useUsersQueries(
    state.page,
    state.debouncedSearch,
    state.selectedUser
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

  const data = usersQuery.data;
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Users</h1>
          <p className="text-zinc-400 text-sm mt-1">All registered accounts — newest first</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={state.search}
            onChange={(e) => state.setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-105 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <TopPerformers
        topPerformers={topUsersQuery.data?.data || []}
        onSelectUser={state.setSelectedUser}
      />

      <UsersTable
        users={data?.data || []}
        onSelectUser={state.setSelectedUser}
        onUpdateFlags={(id, flags) => updateFlags.mutate({ id, flags })}
        page={state.page}
        setPage={state.setPage}
        totalPages={totalPages}
        totalUsers={data?.total || 0}
      />

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
        />
      )}
    </div>
  );
}
