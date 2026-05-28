import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { ReferralsResponse } from "../types";

export function useReferralsQueries(page: number) {
  const referralsQuery = useQuery<ReferralsResponse>({
    queryKey: ["admin-referrals", page],
    queryFn: () => apiClient.get(`/admin/referrals?page=${page}&limit=20`) as any,
  });

  return {
    referralsQuery,
  };
}
