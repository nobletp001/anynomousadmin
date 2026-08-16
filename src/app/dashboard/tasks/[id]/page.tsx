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
import { SecuredSpotsPanel } from "./components/SecuredSpotsPanel";
import { AssistSubmissionPanel } from "./components/AssistSubmissionPanel";
import { BulkActionPanel } from "./components/BulkActionPanel";
import { TaskDetailModals } from "./components/TaskDetailModals";
import { BusinessPaymentConfirmModal } from "./components/BusinessPaymentConfirmModal";
import { SlotUserPicker } from "../components/SlotUserPicker";
import { downloadPDFReport } from "./pdf-report";
import { downloadExcelReport } from "./excel-report";
import { downloadClientTaskBrief } from "./client-brief";
import { Submission, SubmissionsResponse, Task } from "./types";
import { isActionableSubmissionStatus } from "./utils";
import { apiClient } from "@/services/api-client";
import { toast } from "sonner";

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
  const [slotSelectedUsers, setSlotSelectedUsers] = React.useState<string[]>([]);
  const [slotBulkUsers, setSlotBulkUsers] = React.useState("");
  const [businessPaymentAction, setBusinessPaymentAction] = React.useState<
    "confirm_payment" | "approve_task" | "reject_task" | "reject_payment" | null
  >(null);
  const [businessPaymentModal, setBusinessPaymentModal] = React.useState<
    "confirm_payment" | "approve_task" | "reject_task" | "reject_payment" | null
  >(null);

  const { submissionsQuery, officersQuery, securedSpotsQuery } = useTaskQueries(
    taskId,
    state.statusFilter,
    state.debouncedSearch,
    state.submissionsPage,
    state.submissionsLimit
  );
  const task = submissionsQuery.data?.data?.task;
  const submissions = submissionsQuery.data?.data?.submissions ?? [];
  const submissionsPagination = submissionsQuery.data?.data?.pagination;
  const officers = officersQuery.data?.data ?? [];
  const securedSpots = securedSpotsQuery.data?.data ?? [];

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

  const fetchAllSubmissionsForExport = React.useCallback(async () => {
    const total = submissionsPagination?.total ?? submissions.length;
    if (total <= submissions.length) {
      return submissions;
    }

    const pageLimit = 250;
    const maxExportRows = 10000;
    const all: Submission[] = [];

    for (let page = 1; ; page++) {
      const params = new URLSearchParams({ page: String(page), limit: String(pageLimit) });
      if (state.statusFilter) params.set("status", state.statusFilter);
      if (state.debouncedSearch) params.set("search", state.debouncedSearch);
      const res = (await apiClient.get(
        `/admin/tasks/${taskId}/submissions?${params.toString()}`
      )) as SubmissionsResponse;
      const pageSubmissions = res.data?.submissions ?? [];
      all.push(...pageSubmissions);

      if (all.length > maxExportRows) {
        throw new Error(
          `Export is limited to ${maxExportRows.toLocaleString()} submissions. Narrow the filters and try again.`
        );
      }

      if (!res.data?.pagination?.hasMore || pageSubmissions.length === 0) {
        break;
      }
    }

    return all;
  }, [state.debouncedSearch, state.statusFilter, submissions, submissionsPagination?.total, taskId]);

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

  React.useEffect(() => {
    clearBulkSelection();
    state.setSubmissionsPage(1);
  }, [state.statusFilter, state.debouncedSearch]);

  React.useEffect(() => {
    clearBulkSelection();
  }, [state.submissionsPage]);

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
        toast.success(
          `@${username} is now under watch. ${
            (data as any).newAlerts?.length > 0
              ? `${(data as any).newAlerts.length} fraud signal(s) detected.`
              : "No immediate flags found. Monitoring is active."
          }`
        );
      } else {
        toast.error(`Failed to track user: ${(data as any).error}`);
      }
    } catch {
      toast.error("Network error. Could not place user under watch.");
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
    editState.setEditIsForClient(!!(task.isForClient || task.creatorType === "business"));
    editState.setEditClientUsername(task.clientUsername || (task.creatorType === "business" ? task.createdBy : ""));
    editState.setEditClientAmountPaid(
      getBusinessReviewValue(task.clientRequestReviews, "Client amount paid:").replace(/[^\d]/g, "")
    );
    editState.setEditClientPricePerUser(
      getBusinessReviewValue(task.clientRequestReviews, "Client price per user:").replace(/[^\d]/g, "")
    );
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
    editState.setEditIsTobeIncludereferralCount(
      task.isTobeIncludereferralCount !== undefined ? !!task.isTobeIncludereferralCount : true
    );
    editState.setEditIsAddedNewReferral(!!task.isAddedNewReferral);
    editState.setEditAmountAddedFortheReeferral(String(task.amountAddedFortheReeferral ?? ""));
    editState.setEditTargetCount(String(task.targetCount ?? ""));
    editState.setEditAdminContact(task.adminContact || "");
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
    editState.setEditSecureSpotIsExactDays(!!task.secureSpotIsExactDays);
    editState.setEditSecureSpotIsPerDay(!!task.secureSpotIsPerDay);
    editState.setEditSecureSpotNumberPerDay(String(task.secureSpotNumberPerDay ?? ""));
    editState.setEditAdditionalSlots(String(task.additionalSlots ?? 0));
    editState.setEditScheduledAt(
      task.scheduledAt
        ? new Date(new Date(task.scheduledAt).getTime() - new Date(task.scheduledAt).getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : ""
    );
    editState.setEditIsPinned(!!task.isPinned);
    editState.setEditBlockSameDevice(task.blockSameDevice !== false);
    editState.setEditHasClientRequestReview(!!task.hasClientRequestReview);
    let reviewsList: string[] = [""];
    try {
      if (task.clientRequestReviews) {
        const parsed = Array.isArray(task.clientRequestReviews)
          ? task.clientRequestReviews
          : JSON.parse(task.clientRequestReviews as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          reviewsList = parsed;
        }
      }
    } catch {
      // ignore
    }
    editState.setEditClientRequestReviews(reviewsList);
    editState.setUploadError("");
  };

  const runBusinessPaymentAction = (
    action: "confirm_payment" | "approve_task" | "reject_task" | "reject_payment",
    payload?: { amountReceived?: number; reason?: string }
  ) => {
    setBusinessPaymentAction(action);
    mutations.businessPaymentReview.mutate(
      { action, ...payload },
      {
        onSuccess: () => {
          if (action === "confirm_payment") toast.success("Money confirmed. You can now accept the task.");
          if (action === "approve_task") toast.success("Task accepted and activated.");
          if (action === "reject_payment") toast.success("Money rejected and task marked rejected.");
          if (action === "reject_task") toast.success("Task rejected and unused client funds refunded.");
          setBusinessPaymentModal(null);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to review business payment.");
        },
        onSettled: () => setBusinessPaymentAction(null),
      }
    );
  };

  const downloadSubmissionExport = async (format: "pdf" | "excel") => {
    try {
      const exportSubmissions = await fetchAllSubmissionsForExport();
      if (format === "pdf") {
        downloadPDFReport(task, exportSubmissions);
      } else {
        downloadExcelReport(task, exportSubmissions);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export submissions.");
    }
  };

  return (
    <div className="space-y-6">
      <TaskDetailHeader
        task={task}
        submissionsCount={task.submissionCount ?? submissionsPagination?.total ?? submissions.length}
        onBack={() => router.back()}
        onDownloadPDF={() => downloadSubmissionExport("pdf")}
        onDownloadClientBrief={() => downloadClientTaskBrief(task)}
        onDownloadExcel={() => downloadSubmissionExport("excel")}
        onEditClick={handleEditClick}
        onToggleStatusClick={() => mutations.toggleTaskStatus.mutate(task.status === "active" ? "closed" : "active")}
        businessPaymentAction={businessPaymentAction}
        onBusinessPaymentAction={(action) => setBusinessPaymentModal(action)}
        onSendReminderClick={() => {
          mutations.sendOpenWindowReminders.mutate(undefined, {
            onSuccess: (res: any) => {
              const queued = Number(res?.data?.queued ?? 0);
              const eligible = Number(res?.data?.eligible ?? queued);
              toast.success(
                `Reminder queued for ${queued} user${queued === 1 ? "" : "s"} with an open window.${eligible === 0 ? " No eligible open windows were found." : ""}`
              );
            },
            onError: (error) => {
              toast.error(error instanceof Error ? error.message : "Failed to send reminders.");
            },
          });
        }}
        toggleStatusPending={mutations.toggleTaskStatus.isPending}
        businessPaymentPending={mutations.businessPaymentReview.isPending}
        reminderPending={mutations.sendOpenWindowReminders.isPending}
      />

      {businessPaymentModal && (
        <BusinessPaymentConfirmModal
          action={businessPaymentModal}
          isPending={mutations.businessPaymentReview.isPending}
          error={mutations.businessPaymentReview.error}
          expectedAmount={getBusinessExpectedTotal(task)}
          paymentMethod={getBusinessPaymentMethod(task)}
          onClose={() => setBusinessPaymentModal(null)}
          onConfirm={(payload) => runBusinessPaymentAction(businessPaymentModal, payload)}
        />
      )}

      {task.isSecureSpotTask && (
        <div className="space-y-4">
          <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">Assign Slots</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Search and add users one by one, or paste many usernames/emails in bulk.
                </p>
              </div>
              <button
                type="button"
                disabled={
                  mutations.addSecuredSpots.isPending || (slotSelectedUsers.length === 0 && !slotBulkUsers.trim())
                }
                onClick={() => {
                  mutations.addSecuredSpots.mutate([...slotSelectedUsers, slotBulkUsers].filter(Boolean), {
                    onSuccess: () => {
                      setSlotSelectedUsers([]);
                      setSlotBulkUsers("");
                    },
                  });
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {mutations.addSecuredSpots.isPending ? "Adding..." : "Assign Slots"}
              </button>
            </div>
            <SlotUserPicker
              selectedUsers={slotSelectedUsers}
              onChange={setSlotSelectedUsers}
              bulkUsers={slotBulkUsers}
              onBulkChange={setSlotBulkUsers}
            />
          </div>

          <SecuredSpotsPanel
            spots={securedSpots}
            isLoading={securedSpotsQuery.isLoading}
            removingUsername={(mutations.removeSecuredSpot.variables as string | undefined) ?? null}
            onRemoveSpot={(spot) => {
              if (window.confirm(`Remove @${spot.username}'s booked slot for this task?`)) {
                mutations.removeSecuredSpot.mutate(spot.username);
              }
            }}
            onViewSubmission={(spot) => {
              state.setSearchFilter(spot.username);
              document.getElementById("submissions-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
      )}

      <AssistSubmissionPanel
        task={task}
        isPending={mutations.assistSubmission.isPending}
        onSubmit={(payload) => mutations.assistSubmission.mutate(payload)}
      />

      <div id="submissions-table" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SubmissionsTable
          submissions={submissions}
          pagination={submissionsPagination}
          onPageChange={state.setSubmissionsPage}
          isFetching={submissionsQuery.isFetching}
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
          onRemoveSubmission={(sub) => {
            const message =
              sub.status === "approved"
                ? `Remove @${sub.username}'s approved submission? This will reverse the task earning from their wallet/ledger.`
                : `Remove @${sub.username}'s submission from this task?`;
            if (window.confirm(message)) {
              mutations.removeSubmission.mutate(sub.id);
            }
          }}
        />
      </div>

      {state.selectedIds.size > 0 && (
        <BulkActionPanel
          selectedCount={state.selectedIds.size}
          bulkMode={state.bulkMode}
          setBulkMode={state.setBulkMode}
          bulkRating={state.bulkRating}
          setBulkRating={state.setBulkRating}
          bulkRejectReason={state.bulkRejectReason}
          setBulkRejectReason={state.setBulkRejectReason}
          onClearSelection={clearBulkSelection}
          onConfirmApprove={() => {
            if (state.bulkRating === null) return;
            mutations.bulkAction.mutate({
              ids: Array.from(state.selectedIds),
              action: "approve",
              rating: state.bulkRating,
            });
          }}
          onConfirmReject={() => {
            const rejectionReason = state.bulkRejectReason.trim();
            if (!rejectionReason) return;
            mutations.bulkAction.mutate({
              ids: Array.from(state.selectedIds),
              action: "reject",
              rejectionReason,
            });
          }}
          isPending={mutations.bulkAction.isPending}
        />
      )}

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

function getBusinessExpectedTotal(task: Task) {
  const amountPaid = getBusinessReviewValue(task.clientRequestReviews, "Client amount paid:");
  const paid = Number(String(amountPaid || "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(paid) && paid > 0) return Math.round(paid);
  const pricePerUser = getBusinessReviewValue(task.clientRequestReviews, "Client price per user:");
  const price = Number(String(pricePerUser || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(price) || price <= 0 || task.numberOfUsersNeeded <= 0) return null;
  return Math.round(price * task.numberOfUsersNeeded);
}

function getBusinessPaymentMethod(task: Task) {
  return getBusinessReviewValue(task.clientRequestReviews, "Payment method:") || "manual";
}

function getBusinessReviewValue(raw: Task["clientRequestReviews"], prefix: string) {
  const notes = parseBusinessReviewNotes(raw);
  const row = notes.find((note) => note.toLowerCase().startsWith(prefix.toLowerCase()));
  return row ? row.slice(prefix.length).trim() : "";
}

function parseBusinessReviewNotes(raw: Task["clientRequestReviews"]) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
