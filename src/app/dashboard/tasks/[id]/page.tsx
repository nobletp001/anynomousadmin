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
import { AppTestingQualifyModal } from "./components/AppTestingQualifyModal";
import { AppReviewRequestModal } from "./components/AppReviewRequestModal";
import { SlotUserPicker } from "../components/SlotUserPicker";
import { downloadPDFReport } from "./pdf-report";
import { downloadExcelReport } from "./excel-report";
import { downloadClientTaskBrief } from "./client-brief";
import { AppTestingSettings, BusinessReviewRequest, Submission, SubmissionsResponse, Task } from "./types";
import { formatAmount, formatDate, getImagesList, isActionableSubmissionStatus } from "./utils";
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
  const [appTestingQualifyModal, setAppTestingQualifyModal] = React.useState<Submission | null>(null);
  const [appReviewRequestModal, setAppReviewRequestModal] = React.useState<Submission | null>(null);
  const [appReviewRequestText, setAppReviewRequestText] = React.useState("");

  const { submissionsQuery, officersQuery, securedSpotsQuery } = useTaskQueries(
    taskId,
    state.statusFilter,
    state.debouncedSearch,
    state.submissionsPage,
    state.submissionsLimit
  );
  const task = submissionsQuery.data?.data?.task;
  const submissions = submissionsQuery.data?.data?.submissions ?? [];
  const reviewRequests = submissionsQuery.data?.data?.reviewRequests ?? [];
  const appTesting = submissionsQuery.data?.data?.appTesting ?? null;
  const appTestingApprovedPortfolioCount = submissionsQuery.data?.data?.appTestingApprovedPortfolioCount ?? 0;
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
    const isAppTestingTask = task?.taskType === "app_testing" || task?.targetPlatform === "app_testing";
    state.setRejectModal({
      subId: sub.id,
      username: sub.username,
      balance: isAppTestingTask ? 0 : sub.userBalance,
      mode: isAppTestingTask ? "app_testing_reject" : "reject",
    });
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

  const requestAppReview = (sub: Submission) => {
    mutations.requestBusinessReview.reset();
    setAppReviewRequestModal(sub);
    setAppReviewRequestText(
      "Download/open the app, use one or two features, leave an honest Play Store review about your experience, then upload a screenshot showing the submitted review."
    );
  };

  const confirmRequestAppReview = () => {
    if (!appReviewRequestModal) return;
    const reviewText = appReviewRequestText.trim();
    if (!reviewText) return;
    mutations.requestBusinessReview.mutate(
      { submissionId: appReviewRequestModal.id, reviewText },
      {
        onSuccess: () => {
          toast.success("App review request sent to the user.");
          setAppReviewRequestModal(null);
          setAppReviewRequestText("");
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to request app review."),
      }
    );
  };

  const qualifyAppTester = (sub: Submission) => {
    mutations.qualifyAppTestingSubmission.reset();
    setAppTestingQualifyModal(sub);
  };

  const confirmQualifyAppTester = () => {
    if (!appTestingQualifyModal) return;
    mutations.qualifyAppTestingSubmission.mutate(appTestingQualifyModal.id, {
      onSuccess: () => {
        toast.success(`@${appTestingQualifyModal.username}'s portfolio was approved for app testing.`);
        setAppTestingQualifyModal(null);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to approve portfolio."),
    });
  };

  const finalizeAppTester = (sub: Submission) => {
    const defaultReward = appTesting?.userRewardAmount || task.amount || 0;
    const rewardText = window.prompt(`Final reward for @${sub.username}:`, defaultReward ? String(defaultReward) : "");
    if (!rewardText) return;
    const rewardAmount = Number.parseInt(rewardText.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
      toast.error("Enter a valid reward amount.");
      return;
    }
    const ratingText = window.prompt(`Rating for @${sub.username} (1-5):`, "5");
    const rating = Number.parseInt(ratingText || "5", 10);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }
    const feedback = window.prompt("Optional feedback:", "App testing completed.");
    mutations.finalizeAppTestingSubmission.mutate(
      { subId: sub.id, rewardAmount, rating, feedback: feedback?.trim() || undefined },
      {
        onSuccess: () => toast.success(`Final reward ${formatAmount(rewardAmount)} credited to @${sub.username}.`),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to finalize reward."),
      }
    );
  };

  return (
    <div className="space-y-6">
      <TaskDetailHeader
        task={task}
        appTestingSettings={appTesting}
        approvedPortfolioCount={appTestingApprovedPortfolioCount}
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

      {appTestingQualifyModal && (
        <AppTestingQualifyModal
          username={appTestingQualifyModal.username}
          isPending={mutations.qualifyAppTestingSubmission.isPending}
          error={mutations.qualifyAppTestingSubmission.error}
          onClose={() => {
            mutations.qualifyAppTestingSubmission.reset();
            setAppTestingQualifyModal(null);
          }}
          onConfirm={confirmQualifyAppTester}
        />
      )}

      {appReviewRequestModal && (
        <AppReviewRequestModal
          submission={appReviewRequestModal}
          reviewText={appReviewRequestText}
          setReviewText={setAppReviewRequestText}
          isPending={mutations.requestBusinessReview.isPending}
          error={mutations.requestBusinessReview.error}
          onClose={() => {
            mutations.requestBusinessReview.reset();
            setAppReviewRequestModal(null);
            setAppReviewRequestText("");
          }}
          onConfirm={confirmRequestAppReview}
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

      {(task.taskType === "app_testing" || task.targetPlatform === "app_testing") && (
        <AppTestingPanel
          settings={appTesting}
          approvedPortfolioCount={appTestingApprovedPortfolioCount}
          isPending={mutations.updateAppTestingSettings.isPending}
          onSave={(payload) =>
            mutations.updateAppTestingSettings.mutate(payload, {
              onSuccess: () => toast.success("App testing settings saved."),
              onError: (error) =>
                toast.error(error instanceof Error ? error.message : "Failed to save app testing settings."),
            })
          }
        />
      )}

      <AppReviewRequestsPanel
        requests={reviewRequests}
        isPending={mutations.withdrawBusinessReview.isPending || mutations.decideBusinessReview.isPending}
        onWithdraw={(request) => {
          if (window.confirm(`Withdraw app review request for @${request.username}?`)) {
            mutations.withdrawBusinessReview.mutate(request.id, {
              onSuccess: () => toast.success("App review request withdrawn."),
              onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to withdraw request."),
            });
          }
        }}
        onApprove={(request) =>
          mutations.decideBusinessReview.mutate(
            { requestId: request.id, action: "approve" },
            {
              onSuccess: () => toast.success("Review approved. ₦100 moved to the user wallet."),
              onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to approve review."),
            }
          )
        }
        onDispute={(request) => {
          const reason = window.prompt(`Dispute app review from @${request.username}. Add a reason:`);
          if (!reason?.trim()) return;
          mutations.decideBusinessReview.mutate(
            { requestId: request.id, action: "dispute", reason: reason.trim() },
            {
              onSuccess: () => toast.success("Review disputed. Client-funded holds were returned where applicable."),
              onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to dispute review."),
            }
          );
        }}
      />

      <div id="submissions-table" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SubmissionsTable
          submissions={submissions}
          task={task}
          reviewRequests={reviewRequests}
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
              (task.taskType === "app_testing" || task.targetPlatform === "app_testing") && sub.status === "qualified"
                ? `Remove @${sub.username}'s approved app-testing portfolio? They will no longer count as qualified.`
                : sub.status === "approved"
                  ? `Remove @${sub.username}'s approved submission? This will reverse the task earning from their wallet/ledger.`
                  : `Remove @${sub.username}'s submission from this task?`;
            if (window.confirm(message)) {
              mutations.removeSubmission.mutate(sub.id);
            }
          }}
          onRequestAppReview={requestAppReview}
          onQualifyAppTesting={qualifyAppTester}
          onFinalizeAppTesting={finalizeAppTester}
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

function AppReviewRequestsPanel({
  requests,
  isPending,
  onWithdraw,
  onApprove,
  onDispute,
}: {
  requests: BusinessReviewRequest[];
  isPending: boolean;
  onWithdraw: (request: BusinessReviewRequest) => void;
  onApprove: (request: BusinessReviewRequest) => void;
  onDispute: (request: BusinessReviewRequest) => void;
}) {
  if (requests.length === 0) return null;
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-200">App review requests</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Admin-created requests do not charge wallet. Client requests hold ₦200 until completion or refund.
          </p>
        </div>
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
          {requests.length} total
        </span>
      </div>
      <div className="grid gap-3">
        {requests.map((request) => {
          const proofImages = getImagesList(request.reviewProof || "");
          return (
            <article key={request.id} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-zinc-100">@{request.username}</p>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                      {request.status}
                    </span>
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-300">
                      {request.sourceType}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">{request.reviewText}</p>
                  {request.reviewProof ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {proofImages.map((proof, index) => (
                        <a
                          key={`${proof}-${index}`}
                          href={proof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-300 hover:text-blue-200"
                        >
                          Proof {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-2 text-[11px] text-zinc-550">
                    {formatAmount(request.amount)} total · user {formatAmount(request.workerAmount)} · requested{" "}
                    {formatDate(request.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "requested" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => onWithdraw(request)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  ) : null}
                  {request.status === "submitted" ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onApprove(request)}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        Approve review
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onDispute(request)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Dispute
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AppTestingPanel({
  settings,
  approvedPortfolioCount,
  isPending,
  onSave,
}: {
  settings: AppTestingSettings | null;
  approvedPortfolioCount: number;
  isPending: boolean;
  onSave: (payload: {
    testingLink?: string | null;
    testingDays?: number | null;
    userRewardAmount?: number | null;
    clientUsername?: string | null;
    clientAmount?: number | null;
    clientPricePerUser?: number | null;
  }) => void;
}) {
  const [testingLink, setTestingLink] = React.useState(settings?.testingLink ?? "");
  const [testingDays, setTestingDays] = React.useState(settings?.testingDays ? String(settings.testingDays) : "");
  const [userRewardAmount, setUserRewardAmount] = React.useState(
    settings?.userRewardAmount ? String(settings.userRewardAmount) : ""
  );
  const [clientUsername, setClientUsername] = React.useState(settings?.clientUsername ?? "");
  const [clientAmount, setClientAmount] = React.useState(settings?.clientAmount ? String(settings.clientAmount) : "");
  const [clientPricePerUser, setClientPricePerUser] = React.useState(
    settings?.clientPricePerUser ? String(settings.clientPricePerUser) : ""
  );

  React.useEffect(() => {
    setTestingLink(settings?.testingLink ?? "");
    setTestingDays(settings?.testingDays ? String(settings.testingDays) : "");
    setUserRewardAmount(settings?.userRewardAmount ? String(settings.userRewardAmount) : "");
    setClientUsername(settings?.clientUsername ?? "");
    setClientAmount(settings?.clientAmount ? String(settings.clientAmount) : "");
    setClientPricePerUser(settings?.clientPricePerUser ? String(settings.clientPricePerUser) : "");
  }, [settings]);

  const integerOrNull = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? Number.parseInt(cleaned, 10) : null;
  };
  const decimalOrNull = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    if (!cleaned || cleaned === ".") return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const clientTotalAmount = integerOrNull(clientAmount);
  const clientPerUserAmount = decimalOrNull(clientPricePerUser);
  const expectedClientTotal =
    clientPerUserAmount !== null && approvedPortfolioCount > 0 ? clientPerUserAmount * approvedPortfolioCount : null;

  return (
    <section className="rounded-2xl border border-sky-500/20 bg-sky-950/10 p-4 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-sky-200">App testing setup</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Qualify applicants first. Link, days, reward, and client oversight can be changed before final reward.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onSave({
              testingLink: testingLink.trim() || null,
              testingDays: integerOrNull(testingDays),
              userRewardAmount: integerOrNull(userRewardAmount),
              clientUsername: clientUsername.trim().replace(/^@/, "") || null,
              clientAmount: integerOrNull(clientAmount),
              clientPricePerUser: decimalOrNull(clientPricePerUser),
            })
          }
          className="rounded-xl bg-sky-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 hover:bg-sky-300 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save setup"}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <AppTestingInput
          label="Testing link"
          value={testingLink}
          onChange={setTestingLink}
          placeholder="Optional app link"
        />
        <AppTestingInput label="Testing days" value={testingDays} onChange={setTestingDays} placeholder="e.g. 7" />
        <AppTestingInput
          label="User reward"
          value={userRewardAmount}
          onChange={setUserRewardAmount}
          placeholder="e.g. 5000"
        />
        <AppTestingInput
          label="Client username"
          value={clientUsername}
          onChange={setClientUsername}
          placeholder="@client"
        />
        <AppTestingInput
          label="Client amount paid"
          value={clientAmount}
          onChange={setClientAmount}
          placeholder="30000"
        />
        <AppTestingInput
          label="Client price per user"
          value={clientPricePerUser}
          onChange={setClientPricePerUser}
          placeholder="300"
        />
      </div>
      {(clientTotalAmount !== null || expectedClientTotal !== null) && (
        <p className="mt-3 text-[11px] font-semibold text-sky-300">
          {clientTotalAmount !== null ? `Client amount paid: ₦${clientTotalAmount.toLocaleString()}` : ""}
          {clientTotalAmount !== null && expectedClientTotal !== null ? " · " : ""}
          {expectedClientTotal !== null
            ? `Expected total from approved portfolios (${approvedPortfolioCount}): ₦${expectedClientTotal.toLocaleString()}`
            : clientPerUserAmount !== null
              ? `Approved portfolios: ${approvedPortfolioCount}`
              : ""}
        </p>
      )}
    </section>
  );
}

function AppTestingInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/60 focus:outline-none"
      />
    </label>
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
