import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PayoutClaim } from "../types";

export function usePayoutQueries() {
  return useQuery<{ success: boolean; data: PayoutClaim[] }>({
    queryKey: ["admin-payout-claims"],
    queryFn: async () => {
      const [taskResponse, businessResponse] = await Promise.all([
        apiClient.get("/admin/payouts") as Promise<{ success: boolean; data: PayoutClaim[] }>,
        apiClient.get("/admin/business-payouts") as Promise<{ success: boolean; data: PayoutClaim[] }>,
      ]);
      return {
        success: taskResponse.success && businessResponse.success,
        data: [
          ...(taskResponse.data ?? []).map((claim) => ({ ...claim, scope: "task" as const })),
          ...(businessResponse.data ?? []).map((claim) => ({ ...claim, scope: "business" as const })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      };
    },
  });
}
