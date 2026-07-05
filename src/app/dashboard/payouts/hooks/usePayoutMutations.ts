import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface PayoutMutationCallbacks {
  onSuccess: () => void;
  onError: (err: any) => void;
  onConfirmRequired: (expiresInSeconds: number, claimId: number, idempotencyKey: string) => void;
}

function makeIdempotencyKey(id: number, status: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `admin-payout-${id}-${status}-${crypto.randomUUID()}`;
  }
  return `admin-payout-${id}-${status}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function usePayoutMutations(callbacks: PayoutMutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      id: number;
      status: "paid" | "rejected";
      confirmToken?: string;
      idempotencyKey?: string;
    }) => {
      const { id, status, confirmToken, idempotencyKey } = variables;
      const requestIdempotencyKey = idempotencyKey || makeIdempotencyKey(id, status);
      variables.idempotencyKey = requestIdempotencyKey;
      return apiClient.patch(`/admin/payouts/${id}/status`, {
        status,
        idempotencyKey: requestIdempotencyKey,
        ...(confirmToken ? { confirmToken } : {}),
      }) as Promise<any>;
    },
    onSuccess: async (data: any, variables) => {
      if (data?.requiresConfirmation) {
        callbacks.onConfirmRequired(
          data.expiresInSeconds ?? 60,
          variables.id,
          variables.idempotencyKey || makeIdempotencyKey(variables.id, variables.status)
        );
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-payout-claims"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-redeemers"] }),
      ]);
      callbacks.onSuccess();
    },
    onError: (err: any) => {
      callbacks.onError(err);
    },
  });
}
