"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTaskQueries } from "./hooks/useTaskQueries";
import { useTaskMutations } from "./hooks/useTaskMutations";
import { useTaskState } from "./hooks/useTaskState";
import { useEditTaskState } from "./hooks/useEditTaskState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { TaskDetailHeader } from "./components/TaskDetailHeader";
import { SubmissionsTable } from "./components/SubmissionsTable";
import { SubmissionDetailsModal } from "./components/SubmissionDetailsModal";
import { RejectModal } from "./components/RejectModal";
import { BulkActionPanel } from "./components/BulkActionPanel";
import { EditTaskModal } from "./components/EditTaskModal";
import { FullscreenImageZoom } from "./components/FullscreenImageZoom";
import { downloadPDFReport } from "./pdf-report";
import { Submission } from "./types";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl.slice(0, -4) : rawApiUrl;

export default function TaskSubmissionsPage() {
  const router = useRouter();
  const taskId = useParams().id as string;
  const state = useTaskState();
  const editState = useEditTaskState();

  const { submissionsQuery, officersQuery } = useTaskQueries(taskId, state.statusFilter, state.debouncedSearch);
  const task = submissionsQuery.data?.task;
  const submissions = submissionsQuery.data?.submissions ?? [];
  const officers = officersQuery.data?.data ?? [];

  const advanceToNextPending = (currentSubId: number) => {
    const pendings = submissions.filter((s) => s.status === "pending" || s.status === "needs_correction");
    const currentIdx = pendings.findIndex((s) => s.id === currentSubId);
    state.setViewingSub(currentIdx !== -1 && currentIdx < pendings.length - 1 ? pendings[currentIdx + 1] : null);
  };

  const closeRejectModal = () => {
    state.setRejectModal(null);
    state.setDeductAmount("");
    state.setRejectReason("");
  };

  const clearBulkSelection = () => {
    state.setSelectedIds(new Set());
    state.setBulkMode("none");
    state.setBulkRating(null);
    state.setBulkRejectReason("");
  };

  const closeViewingSub = () => {
    state.setViewingSub(null);
    state.setShowReportForm(false);
    state.setReportDeductAmount("");
    state.setReportReason("");
  };

  const closeEditTask = () => editState.setIsEditingTask(false);

  const mutations = useTaskMutations(taskId, {
    advanceToNextPending, closeRejectModal, clearBulkSelection, closeViewingSub, closeEditTask,
  });

  const openRejectModal = (sub: Submission) => {
    state.setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: "reject" });
    state.setDeductAmount("");
    state.setRejectReason("");
  };

  const openCorrectionModal = (sub: Submission) => {
    state.setRejectModal({ subId: sub.id, username: sub.username, balance: sub.userBalance, mode: "correction" });
    state.setDeductAmount("");
    state.setRejectReason("");
  };

  const handleWatchUser = async (username: string) => {
    try {
      const token = sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/admin/fraud/users/${username}/monitor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monitored: true, runAnalysis: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ @${username} is now under watch.\n${data.newAlerts?.length > 0 ? `${data.newAlerts.length} fraud signal(s) detected.` : "No immediate flags found — monitoring is active."}`);
      } else {
        alert(`Failed to track user: ${data.error}`);
      }
    } catch {
      alert("Network error — could not place user under watch.");
    }
  };

  useKeyboardShortcuts({
    viewingSub: state.viewingSub, rejectModal: state.rejectModal,
    onCloseReject: closeRejectModal, onCloseDetails: () => state.setViewingSub(null),
    rating: state.rating, setRating: state.setRating, feedback: state.feedback, submissions, setViewingSub: state.setViewingSub,
    onApprove: (r, f) => mutations.approveSubmission.mutate({ subId: state.viewingSub!.id, rating: r, feedback: f }),
    onRejectClick: openRejectModal, onCorrectionClick: openCorrectionModal,
  });

  if (submissionsQuery.isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
        <div className="h-64 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl" />
      </div>
    );
  }

  if (submissionsQuery.error || !task) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-zinc-400 text-sm">Failed to load submissions</p>
        <Button variant="outline" size="sm" onClick={() => submissionsQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  const handleEditClick = () => {
    editState.setIsEditingTask(true);
    editState.setEditTimeline(task.timeline ? task.timeline.split("T")[0] : "");
    editState.setEditLifeline(!!task.lifeline);
    editState.setEditNumberOfUsers(String(task.numberOfUsersNeeded));
    editState.setEditAmount(String(task.amount));
    editState.setEditLink(task.link || "");
    editState.setEditAssignedOfficer(task.assignedOfficer || "");
    editState.setEditInstructions(task.instructions ? JSON.parse(task.instructions) : []);
    editState.setEditCaption(task.caption || "");
    editState.setEditTaskType(task.taskType || "follow");
    editState.setEditTargetPlatform(task.targetPlatform || "instagram");
    editState.setEditProofType(task.proofType === "url" ? "url" : "banner");
    editState.setEditAcceptText(!!task.acceptText);
    editState.setEditTextLabel(task.textLabel || "");
    editState.setEditAcceptNumber(!!task.acceptNumber);
    editState.setEditNumberLabel(task.numberLabel || "");
    editState.setEditAcceptMultipleImages(!!task.acceptMultipleImages);
    editState.setEditTargetCount(String(task.targetCount ?? ""));
    editState.setEditAdminContact(task.adminContact || "");
    editState.setEditMaxPerHour(String(task.maxPerHour ?? ""));
    editState.setEditNoExpiry(!!task.lifeline);
    editState.setEditEnableTargeting(!!task.targetAudience);
    editState.setEditAudience(task.targetAudience ? JSON.parse(task.targetAudience) : { gender: [], employmentStatus: [], educationLevel: [], state: [], minAge: "", maxAge: "" });
    editState.setEditImages(task.images ? JSON.parse(task.images).map((url: string) => ({ url })) : []);
    let promptsText = "";
    try {
      const promptsArray = task.prompts ? JSON.parse(task.prompts) : [];
      promptsText = Array.isArray(promptsArray) ? promptsArray.join("\n\n") : "";
    } catch {
      promptsText = task.prompts || "";
    }
    editState.setEditPrompts(promptsText);
    editState.setEditRequirePromptSelection(!!task.requirePromptSelection);
    editState.setUploadError("");
  };

  return (
    <div className="space-y-6">
      <TaskDetailHeader
        task={task} submissionsCount={submissions.length} onBack={() => router.back()}
        onDownloadPDF={() => downloadPDFReport(task, submissions)}
        onEditClick={handleEditClick}
        onToggleStatusClick={() => mutations.toggleTaskStatus.mutate(task.status === "active" ? "closed" : "active")}
        toggleStatusPending={mutations.toggleTaskStatus.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SubmissionsTable
          submissions={submissions} selectedIds={state.selectedIds} setSelectedIds={state.setSelectedIds}
          viewingSub={state.viewingSub} setViewingSub={state.setViewingSub} searchFilter={state.searchFilter}
          setSearchFilter={state.setSearchFilter} statusFilter={state.statusFilter} setStatusFilter={state.setStatusFilter}
          openCorrectionModal={openCorrectionModal} openRejectModal={openRejectModal}
        />

        {state.viewingSub && (
          <SubmissionDetailsModal
            sub={state.viewingSub} submissions={submissions} task={task} rating={state.rating} setRating={state.setRating}
            feedback={state.feedback} setFeedback={state.setFeedback} showReportForm={state.showReportForm}
            setShowReportForm={state.setShowReportForm} reportDeductAmount={state.reportDeductAmount}
            setReportDeductAmount={state.setReportDeductAmount} reportReason={state.reportReason}
            setReportReason={state.setReportReason} isReportPending={mutations.reportSubmission.isPending}
            onSubmitReport={() => mutations.reportSubmission.mutate({ subId: state.viewingSub!.id, deductedAmount: Number(state.reportDeductAmount) || 0, rejectionReason: state.reportReason })}
            onZoomImage={(imgs, idx) => { state.setActiveImagesList(imgs); state.setActiveImageIndex(idx); }}
            onClose={() => state.setViewingSub(null)}
            onApprove={() => mutations.approveSubmission.mutate({ subId: state.viewingSub!.id, rating: state.rating || 5, feedback: state.feedback })}
            onCorrectionClick={() => openCorrectionModal(state.viewingSub!)}
            onRejectClick={() => openRejectModal(state.viewingSub!)}
            isApprovePending={mutations.approveSubmission.isPending}
            onWatchUser={handleWatchUser}
          />
        )}
      </div>

      {state.selectedIds.size > 0 && (
        <BulkActionPanel
          selectedCount={state.selectedIds.size} bulkMode={state.bulkMode} setBulkMode={state.setBulkMode}
          bulkRating={state.bulkRating} setBulkRating={state.setBulkRating} bulkRejectReason={state.bulkRejectReason}
          setBulkRejectReason={state.setBulkRejectReason} onClearSelection={() => state.setSelectedIds(new Set())}
          onConfirmApprove={() => mutations.bulkAction.mutate({ ids: Array.from(state.selectedIds), action: "approve", rating: state.bulkRating || 5 })}
          onConfirmReject={() => mutations.bulkAction.mutate({ ids: Array.from(state.selectedIds), action: "reject", rejectionReason: state.bulkRejectReason })}
          isPending={mutations.bulkAction.isPending}
        />
      )}

      {state.rejectModal && (
        <RejectModal
          rejectModal={state.rejectModal} deductAmount={state.deductAmount} setDeductAmount={state.setDeductAmount}
          rejectReason={state.rejectReason} setRejectReason={state.setRejectReason} onClose={closeRejectModal}
          onSubmitReject={() => mutations.rejectSubmission.mutate({ subId: state.rejectModal!.subId, reason: state.rejectReason, deducted: Number(state.deductAmount) || 0 })}
          onSubmitCorrection={() => mutations.requestCorrection.mutate({ subId: state.rejectModal!.subId, reason: state.rejectReason })}
          isPending={mutations.rejectSubmission.isPending || mutations.requestCorrection.isPending}
          error={mutations.rejectSubmission.error || mutations.requestCorrection.error}
        />
      )}

      {state.activeImageIndex !== null && state.activeImagesList.length > 0 && (
        <FullscreenImageZoom
          activeIndex={state.activeImageIndex} imagesList={state.activeImagesList} username={state.viewingSub?.username}
          onClose={() => state.setActiveImageIndex(null)}
          onPrev={() => state.setActiveImageIndex((idx) => idx !== null ? (idx - 1 + state.activeImagesList.length) % state.activeImagesList.length : null)}
          onNext={() => state.setActiveImageIndex((idx) => idx !== null ? (idx + 1) % state.activeImagesList.length : null)}
        />
      )}

      {editState.isEditingTask && task && (
        <EditTaskModal
          task={task} editState={editState} officers={officers} onClose={() => editState.setIsEditingTask(false)}
          updateTaskMutation={mutations.updateTask} uploadImageMutation={mutations.uploadImage}
        />
      )}
    </div>
  );
}
