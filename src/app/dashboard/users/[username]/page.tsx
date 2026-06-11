"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";
import { UserStatsGrid } from "../components/UserStatsGrid";
import { FinancialBreakdown } from "../components/FinancialBreakdown";
import { DemographicsAndBank } from "../components/DemographicsAndBank";
import { AdminActionsHistory } from "../components/AdminActionsHistory";
import { AdminActionForm } from "../components/AdminActionForm";
import { UserDetailsHeader } from "../components/UserDetailsHeader";
import { UserTasksTable } from "../components/UserTasksTable";
import { UserReferralsTable } from "../components/UserReferralsTable";

export default function UserDetailPage() {
  const params = useParams();
  const username = params.username as string;

  // Basic User Details
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Paginated Referrals
  const [refPage, setRefPage] = useState(1);
  const [referralsData, setReferralsData] = useState<any>(null);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Paginated Tasks
  const [taskPage, setTaskPage] = useState(1);
  const [tasksData, setTasksData] = useState<any>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Admin Actions State
  const [actionType, setActionType] = useState("warning");
  const [actionAmount, setActionAmount] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUserDetail = async () => {
    try {
      setLoadingDetail(true);
      setErrorDetail(null);
      const res = await (apiClient.get(`/admin/users/${username}`) as Promise<{ success: boolean; data: any }>);
      setUserDetail(res.data);
    } catch (err: any) {
      setErrorDetail(err?.message || "Failed to load user profile");
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoadingRefs(true);
      const res = await (apiClient.get(`/admin/users/${username}/referrals?page=${refPage}`) as Promise<{
        success: boolean;
        data: any;
      }>);
      setReferralsData(res.data);
    } catch (err) {
      console.error("Failed to load referrals:", err);
    } finally {
      setLoadingRefs(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await (apiClient.get(`/admin/users/${username}/tasks?page=${taskPage}`) as Promise<{
        success: boolean;
        data: any;
      }>);
      setTasksData(res.data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserDetail();
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchReferrals();
    }
  }, [username, refPage]);

  useEffect(() => {
    if (username) {
      fetchTasks();
    }
  }, [username, taskPage]);

  const handleSendAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionMessage.trim()) {
      setActionError("Message is required");
      return;
    }
    const amountVal = actionAmount ? parseFloat(actionAmount) : 0;
    if ((actionType === "deducted" || actionType === "additional") && (isNaN(amountVal) || amountVal <= 0)) {
      setActionError("A valid positive amount is required for deductions or additions.");
      return;
    }

    try {
      setActionSubmitting(true);
      setActionError("");
      setActionSuccess("");
      await apiClient.post(`/admin/users/${username}/actions`, {
        actionType,
        message: actionMessage.trim(),
        amount: amountVal,
      });
      setActionSuccess("Action recorded successfully!");
      setActionMessage("");
      setActionAmount("");
      fetchUserDetail();
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.error || err.message || "Failed to submit action");
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleShaved = async (referredUsername: string, currentShaved: boolean) => {
    const nextShaved = !currentShaved;
    const actionStr = nextShaved ? "shave" : "unshave";
    if (!confirm(`Are you sure you want to ${actionStr} referral @${referredUsername}?`)) return;

    try {
      await apiClient.patch(`/admin/referrals/${referredUsername}/shaved`, {
        shaved: nextShaved,
        reason: `Admin manual referral adjustment`,
      });
      fetchReferrals();
      fetchUserDetail();
    } catch (err: any) {
      alert(err?.message || "Failed to update referral shaved status");
    }
  };

  if (loadingDetail) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-6 w-24 bg-zinc-800 rounded" />
        <div className="h-24 bg-zinc-850 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-850 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (errorDetail || !userDetail) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-base text-red-400 font-bold">{errorDetail || "User not found"}</p>
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm">
            Back to Users List
          </Button>
        </Link>
      </div>
    );
  }

  const { user, profile, bankDetails, stats, actions } = userDetail;
  const financialStats = {
    ...stats,
    violationDebt: user.violationDebt,
  };

  const refTotalPages = referralsData ? Math.ceil(referralsData.total / referralsData.limit) : 1;
  const taskTotalPages = tasksData ? Math.ceil(tasksData.total / tasksData.limit) : 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Back Link */}
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to Users List
      </Link>
      {/* User Header Profile Card */}
      <UserDetailsHeader user={user} />
      {/* Stats Summary Grid */}
      <UserStatsGrid stats={stats} />
      {/* Demographics & Bank Info */}
      <DemographicsAndBank profile={profile} bankDetails={bankDetails} />
      {/* Grid: Financial & Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Col: Financial Breakdown */}
        <div className="space-y-6">
          <FinancialBreakdown stats={financialStats} />
        </div>

        {/* Right Col: Admin Action form */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 p-5 rounded-2xl shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Record Admin Action</h4>
          <AdminActionForm
            actionType={actionType}
            setActionType={setActionType}
            actionAmount={actionAmount}
            setActionAmount={setActionAmount}
            actionMessage={actionMessage}
            setActionMessage={setActionMessage}
            actionError={actionError}
            actionSuccess={actionSuccess}
            isSubmitting={actionSubmitting}
            onSubmit={handleSendAction}
          />
        </div>
      </div>{" "}
      {/* Paginated Tasks list */}
      <UserTasksTable
        tasksData={tasksData}
        loadingTasks={loadingTasks}
        taskPage={taskPage}
        setTaskPage={setTaskPage}
        taskTotalPages={taskTotalPages}
      />
      {/* Paginated Referrals list */}
      <UserReferralsTable
        referralsData={referralsData}
        loadingRefs={loadingRefs}
        refPage={refPage}
        setRefPage={setRefPage}
        refTotalPages={refTotalPages}
        handleToggleShaved={handleToggleShaved}
      />
      {/* Admin Actions History */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-purple-400" />
          Admin Action Logs History ({actions.length})
        </h4>
        <AdminActionsHistory
          actions={actions}
          onCopyRef={handleCopyRef}
          copiedId={copiedId}
          onReverseSuccess={() => {
            fetchUserDetail();
          }}
        />
      </div>
    </div>
  );
}
