import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { SecuredSpot, SubmissionsResponse } from "../types";

export function useTaskQueries(
  taskId: string,
  statusFilter: string,
  debouncedSearch: string,
  submissionsPage: number,
  submissionsLimit: number
) {
  const submissionsQuery = useQuery<SubmissionsResponse>({
    queryKey: ["task-submissions", taskId, statusFilter, debouncedSearch, submissionsPage, submissionsLimit],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(submissionsPage),
        limit: String(submissionsLimit),
      });
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiClient.get(`/admin/tasks/${taskId}/submissions?${params.toString()}`) as any;
    },
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
