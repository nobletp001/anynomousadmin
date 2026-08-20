import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { SecuredSpot } from "../types";

interface MutationCallbacks {
  advanceToNextPending: (subId: number) => void;
  closeRejectModal: () => void;
  clearBulkSelection: () => void;
  closeViewingSub: () => void;
  closeEditTask: () => void;
}

export function useTaskMutations(taskId: string, callbacks: MutationCallbacks) {
  const queryClient = useQueryClient();

  const approveSubmission = useMutation({
    mutationFn: ({ subId, rating, feedback }: { subId: number; rating: number; feedback?: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, { action: "approve", rating, feedback }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.advanceToNextPending(variables.subId);
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: ({ subId, reason, deducted }: { subId: number; reason: string; deducted: number }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: "reject",
        rejectionReason: reason,
        deductedAmount: deducted,
      }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.closeRejectModal();
      callbacks.advanceToNextPending(variables.subId);
    },
  });

  const requestCorrection = useMutation({
    mutationFn: ({ subId, reason }: { subId: number; reason: string }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}`, {
        action: "needs_correction",
        rejectionReason: reason,
      }) as any,
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.closeRejectModal();
      callbacks.advanceToNextPending(variables.subId);
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: (newStatus: "active" | "closed") =>
      apiClient.patch(`/admin/tasks/${taskId}/status`, { status: newStatus }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const businessPaymentReview = useMutation({
    mutationFn: (payload: {
      action: "confirm_payment" | "approve_task" | "reject_task" | "reject_payment";
      reason?: string;
      amountReceived?: number;
    }) => apiClient.post(`/admin/tasks/${taskId}/business-payment-review`, payload) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const requestBusinessReview = useMutation({
    mutationFn: ({ submissionId, reviewText }: { submissionId: number; reviewText: string }) =>
      apiClient.post(`/admin/tasks/${taskId}/review-requests`, { submissionId, reviewText }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const withdrawBusinessReview = useMutation({
    mutationFn: (requestId: number) => apiClient.delete(`/admin/tasks/${taskId}/review-requests/${requestId}`) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const decideBusinessReview = useMutation({
    mutationFn: ({
      requestId,
      action,
      reason,
    }: {
      requestId: number;
      action: "approve" | "dispute";
      reason?: string;
    }) => apiClient.patch(`/admin/tasks/${taskId}/review-requests/${requestId}`, { action, reason }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const updateAppTestingSettings = useMutation({
    mutationFn: (payload: {
      testingLink?: string | null;
      testingDays?: number | null;
      userRewardAmount?: number | null;
      clientUsername?: string | null;
      clientAmount?: number | null;
      clientPricePerUser?: number | null;
    }) => apiClient.patch(`/admin/tasks/${taskId}/app-testing`, payload) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const qualifyAppTestingSubmission = useMutation({
    mutationFn: (subId: number) =>
      apiClient.post(`/admin/tasks/${taskId}/submissions/${subId}/app-testing/qualify`, {}) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const finalizeAppTestingSubmission = useMutation({
    mutationFn: ({
      subId,
      rewardAmount,
      rating,
      feedback,
    }: {
      subId: number;
      rewardAmount: number;
      rating: number;
      feedback?: string;
    }) =>
      apiClient.post(`/admin/tasks/${taskId}/submissions/${subId}/app-testing/finalize`, {
        rewardAmount,
        rating,
        feedback,
      }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const bulkAction = useMutation({
    mutationFn: (payload: {
      ids: number[];
      action: string;
      rating?: number;
      rejectionReason?: string;
      deductedAmount?: number;
    }) => apiClient.post(`/admin/tasks/${taskId}/submissions/bulk`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.clearBulkSelection();
    },
  });

  const reportSubmission = useMutation({
    mutationFn: ({
      subId,
      deductedAmount,
      rejectionReason,
    }: {
      subId: number;
      deductedAmount: number;
      rejectionReason: string;
    }) =>
      apiClient.patch(`/admin/tasks/${taskId}/submissions/${subId}/report`, { deductedAmount, rejectionReason }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.closeViewingSub();
    },
  });

  const updateTask = useMutation({
    mutationFn: (payload: Record<string, any>) => apiClient.patch(`/admin/tasks/${taskId}`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      callbacks.closeEditTask();
    },
  });

  const uploadImage = useMutation({
    mutationFn: ({ base64, mimeType }: { base64: string; mimeType: string }) =>
      apiClient.post("/admin/upload", { base64, mimeType }) as any,
  });

  const reverseSubmission = useMutation({
    mutationFn: (subId: number) =>
      apiClient.post(`/admin/submissions/${subId}/reverse`, { reversePenalty: true }) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const removeSubmission = useMutation({
    mutationFn: (subId: number) => apiClient.delete(`/admin/tasks/${taskId}/submissions/${subId}`) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  const removeSecuredSpot = useMutation({
    mutationFn: (username: string) =>
      apiClient.delete(`/admin/tasks/${taskId}/secured-spots/${encodeURIComponent(username)}`) as any,
    onMutate: async (username) => {
      const queryKey = ["task-secured-spots", taskId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ success: boolean; data: SecuredSpot[] }>(queryKey);

      queryClient.setQueryData<{ success: boolean; data: SecuredSpot[] }>(queryKey, (current) => {
        if (!current?.data) return current;
        return {
          ...current,
          data: current.data.filter((spot) => spot.username.toLowerCase() !== username.toLowerCase()),
        };
      });

      return { previous };
    },
    onError: (_error, _username, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["task-secured-spots", taskId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["task-secured-spots", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
    },
  });

  const addSecuredSpots = useMutation({
    mutationFn: (users: string[]) => apiClient.post(`/admin/tasks/${taskId}/secured-spots`, { users }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-secured-spots", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
    },
  });

  const assistSubmission = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post(`/admin/tasks/${taskId}/submissions/assist`, payload) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-secured-spots", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
    },
  });

  const sendOpenWindowReminders = useMutation({
    mutationFn: () => apiClient.post(`/admin/tasks/${taskId}/reminders/open-window`, {}) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-secured-spots", taskId] });
    },
  });

  return {
    approveSubmission,
    rejectSubmission,
    requestCorrection,
    toggleTaskStatus,
    businessPaymentReview,
    requestBusinessReview,
    withdrawBusinessReview,
    decideBusinessReview,
    updateAppTestingSettings,
    qualifyAppTestingSubmission,
    finalizeAppTestingSubmission,
    bulkAction,
    reportSubmission,
    updateTask,
    uploadImage,
    reverseSubmission,
    removeSubmission,
    removeSecuredSpot,
    addSecuredSpots,
    assistSubmission,
    sendOpenWindowReminders,
  };
}
