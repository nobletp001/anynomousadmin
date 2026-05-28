import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PayoutClaim } from "../types";

export function usePayoutQueries() {
  return useQuery<{ success: boolean; data: PayoutClaim[] }>({
    queryKey: ["admin-payout-claims"],
    queryFn: () => apiClient.get("/admin/payouts") as any,
  });
}
