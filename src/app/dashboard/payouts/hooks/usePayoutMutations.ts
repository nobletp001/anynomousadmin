import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface PayoutMutationCallbacks {
  onSuccess: () => void;
  onError: (err: any) => void;
  onConfirmRequired: (confirmToken: string, expiresInSeconds: number, claimId: number) => void;
}

export function usePayoutMutations(callbacks: PayoutMutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, confirmToken }: { id: number; status: "paid" | "rejected"; confirmToken?: string }) =>
      apiClient.patch(`/admin/payouts/${id}/status`, {
        status,
        ...(confirmToken ? { confirmToken } : {}),
      }) as Promise<any>,
    onSuccess: (data: any, variables) => {
      if (data?.requiresConfirmation) {
        callbacks.onConfirmRequired(data.confirmToken, data.expiresInSeconds ?? 60, variables.id);
        return;
      }
      callbacks.onSuccess();
      queryClient.invalidateQueries({ queryKey: ["admin-payout-claims"] });
    },
    onError: (err: any) => {
      callbacks.onError(err);
    },
  });
}
