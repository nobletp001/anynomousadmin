import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { SecuredSpot, SubmissionsResponse } from "../types";

export function useTaskQueries(taskId: string, statusFilter: string, debouncedSearch: string) {
  const submissionsQuery = useQuery<SubmissionsResponse>({
    queryKey: ["task-submissions", taskId, statusFilter, debouncedSearch],
    queryFn: () =>
      apiClient.get(
        `/admin/tasks/${taskId}/submissions?status=${statusFilter}&search=${encodeURIComponent(debouncedSearch)}`
      ) as any,
    placeholderData: keepPreviousData,
  });

  const officersQuery = useQuery({
    queryKey: ["task-officers"],
    queryFn: () => apiClient.get("/tasks/task-officers") as any,
  });

  const securedSpotsQuery = useQuery<{ success: boolean; data: SecuredSpot[] }>({
    queryKey: ["task-secured-spots", taskId],
    queryFn: () => apiClient.get(`/admin/tasks/${taskId}/secured-spots`) as any,
  });

  return {
    submissionsQuery,
    officersQuery,
    securedSpotsQuery,
  };
}
