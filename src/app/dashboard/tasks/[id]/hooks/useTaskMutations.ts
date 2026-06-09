import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

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
    mutationFn: (subId: number) => apiClient.post(`/admin/submissions/${subId}/reverse`) as any,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] }),
  });

  return {
    approveSubmission,
    rejectSubmission,
    requestCorrection,
    toggleTaskStatus,
    bulkAction,
    reportSubmission,
    updateTask,
    uploadImage,
    reverseSubmission,
  };
}
