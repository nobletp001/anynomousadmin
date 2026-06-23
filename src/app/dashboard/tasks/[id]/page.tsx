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
import { TaskDetailModals } from "./components/TaskDetailModals";
import { downloadPDFReport } from "./pdf-report";
import { downloadExcelReport } from "./excel-report";
import { Submission } from "./types";
import { isActionableSubmissionStatus } from "./utils";
import { apiClient } from "@/services/api-client";

export default function TaskSubmissionsPage() {
  const router = useRouter();
  const taskId = useParams().id as string;
  const state = useTaskState();
  const editState = useEditTaskState();
  const [reverseModal, setReverseModal] = React.useState<{
    subId: number;
    username: string;
    deductedAmount: number;
  } | null>(null);

  const { submissionsQuery, officersQuery } = useTaskQueries(taskId, state.statusFilter, state.debouncedSearch);
  const task = submissionsQuery.data?.data?.task;
  const submissions = submissionsQuery.data?.data?.submissions ?? [];
  const officers = officersQuery.data?.data ?? [];

  const advanceToNextPending = (currentSubId: number) => {
    const pendings = submissions.filter((s) => isActionableSubmissionStatus(s.status));
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
    advanceToNextPending,
    closeRejectModal,
    clearBulkSelection,
    closeViewingSub,
    closeEditTask,
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
      const data = await apiClient.patch(`/admin/fraud/users/${username}/monitor`, {
        monitored: true,
        runAnalysis: true,
      });
      if ((data as any).success) {
        alert(
          `✅ @${username} is now under watch.\n${(data as any).newAlerts?.length > 0 ? `${(data as any).newAlerts.length} fraud signal(s) detected.` : "No immediate flags found — monitoring is active."}`
        );
      } else {
        alert(`Failed to track user: ${(data as any).error}`);
      }
    } catch {
      alert("Network error — could not place user under watch.");
    }
  };

  useKeyboardShortcuts({
    viewingSub: state.viewingSub,
    rejectModal: state.rejectModal,
    onCloseReject: closeRejectModal,
    onCloseDetails: () => state.setViewingSub(null),
    rating: state.rating,
    setRating: state.setRating,
    feedback: state.feedback,
    submissions,
    setViewingSub: state.setViewingSub,
    onApprove: (r, f) => mutations.approveSubmission.mutate({ subId: state.viewingSub!.id, rating: r, feedback: f }),
    onRejectClick: openRejectModal,
    onCorrectionClick: openCorrectionModal,
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
        <Button variant="outline" size="sm" onClick={() => submissionsQuery.refetch()}>
          Retry
        </Button>
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
    let captionText = task.caption || "";
    let captionMode: "text" | "array" = "text";
    if (captionText.startsWith("[") && captionText.endsWith("]")) {
      try {
        const arr = JSON.parse(captionText);
        if (Array.isArray(arr)) {
          captionText = arr.join("\n\n");
          captionMode = "array";
        }
      } catch (_e) {}
    }
    editState.setEditCaption(captionText);
    editState.setEditCaptionMode(captionMode);
    editState.setEditTaskType(task.taskType || "follow");
    editState.setEditTargetPlatform(task.targetPlatform || "instagram");
    editState.setEditProofType(task.proofType === "url" ? "url" : "banner");
    editState.setEditAcceptText(!!task.acceptText);
    editState.setEditTextLabel(task.textLabel || "");
    editState.setEditAcceptNumber(!!task.acceptNumber);
    editState.setEditNumberLabel(task.numberLabel || "");
    editState.setEditAcceptMultipleImages(!!task.acceptMultipleImages);
    editState.setEditIsTobeIncludereferralCount(
      task.isTobeIncludereferralCount !== undefined ? !!task.isTobeIncludereferralCount : true
    );
    editState.setEditTargetCount(String(task.targetCount ?? ""));
    editState.setEditAdminContact(task.adminContact || "");
    editState.setEditMaxPerHour(String(task.maxPerHour ?? ""));
    editState.setEditNoExpiry(!!task.lifeline);
    editState.setEditEnableTargeting(!!task.targetAudience);
    editState.setEditAudience(
      task.targetAudience
        ? JSON.parse(task.targetAudience)
        : { gender: [], employmentStatus: [], educationLevel: [], state: [], minAge: "", maxAge: "" }
    );
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
    editState.setEditMarketingText(task.marketingText || "");
    editState.setEditCollectUserName(!!task.collectUserName);
    editState.setEditTargetUsername(task.targetUsername || "");
    editState.setEditIsSecureSpotTask(!!task.isSecureSpotTask);
    editState.setEditSecureSpotIntervalType(
      (task.secureSpotIntervalType as "constant" | "minutes" | "days") || "minutes"
    );
    editState.setEditSecureSpotInterval(String(task.secureSpotInterval ?? ""));
    editState.setEditSecureSpotConstantDelay(String(task.secureSpotConstantDelay ?? ""));
    editState.setEditAdditionalSlots(String(task.additionalSlots ?? 5));
    editState.setEditScheduledAt(
      task.scheduledAt
        ? new Date(new Date(task.scheduledAt).getTime() - new Date(task.scheduledAt).getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : ""
    );
    editState.setEditIsPinned(!!task.isPinned);
    editState.setUploadError("");
  };

  return (
    <div className="space-y-6">
      <TaskDetailHeader
        task={task}
        submissionsCount={submissions.length}
        onBack={() => router.back()}
        onDownloadPDF={() => downloadPDFReport(task, submissions)}
        onDownloadExcel={() => downloadExcelReport(task, submissions)}
        onEditClick={handleEditClick}
        onToggleStatusClick={() => mutations.toggleTaskStatus.mutate(task.status === "active" ? "closed" : "active")}
        toggleStatusPending={mutations.toggleTaskStatus.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SubmissionsTable
          submissions={submissions}
          selectedIds={state.selectedIds}
          setSelectedIds={state.setSelectedIds}
          viewingSub={state.viewingSub}
          setViewingSub={state.setViewingSub}
          searchFilter={state.searchFilter}
          setSearchFilter={state.setSearchFilter}
          statusFilter={state.statusFilter}
          setStatusFilter={state.setStatusFilter}
          openCorrectionModal={openCorrectionModal}
          openRejectModal={openRejectModal}
          openReverseModal={(sub) =>
            setReverseModal({ subId: sub.id, username: sub.username, deductedAmount: sub.deductedAmount ?? 0 })
          }
        />
      </div>

      <TaskDetailModals
        task={task}
        submissions={submissions}
        editState={editState}
        state={state}
        mutations={mutations}
        reverseModal={reverseModal}
        setReverseModal={setReverseModal}
        officers={officers}
        closeRejectModal={closeRejectModal}
        openCorrectionModal={openCorrectionModal}
        openRejectModal={openRejectModal}
        handleWatchUser={handleWatchUser}
      />
    </div>
  );
}
