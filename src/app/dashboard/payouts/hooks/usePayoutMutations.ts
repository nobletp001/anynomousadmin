import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

interface PayoutMutationCallbacks {
  onSuccess: () => void;
  onError: (err: any) => void;
}

export function usePayoutMutations(callbacks: PayoutMutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "paid" | "rejected" }) =>
      apiClient.patch(`/admin/payouts/${id}/status`, { status }) as Promise<any>,
    onSuccess: () => {
      callbacks.onSuccess();
      queryClient.invalidateQueries({ queryKey: ["admin-payout-claims"] });
    },
    onError: (err: any) => {
      callbacks.onError(err);
    },
  });
}
