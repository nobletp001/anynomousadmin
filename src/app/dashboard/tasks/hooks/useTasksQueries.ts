import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { TasksResponse } from "../types";

export function useTasksQueries() {
  const userQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const tasksQuery = useQuery<TasksResponse>({
    queryKey: ["admin-tasks"],
    queryFn: () => apiClient.get("/admin/tasks") as any,
  });

  return {
    userQuery,
    tasksQuery,
  };
}
