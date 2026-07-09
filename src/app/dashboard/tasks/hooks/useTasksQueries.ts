import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { StatusFilter, TasksResponse } from "../types";

const TASKS_PER_PAGE = 1;

export function useTasksQueries(page: number, statusFilter: StatusFilter) {
  const userQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const tasksQuery = useQuery<TasksResponse>({
    queryKey: ["admin-tasks", page, statusFilter],
    queryFn: () => {
      const statusParam = statusFilter === "all" ? "" : `&status=${encodeURIComponent(statusFilter)}`;
      return apiClient.get(`/admin/tasks?page=${page}&limit=${TASKS_PER_PAGE}${statusParam}`) as any;
    },
  });

  return {
    userQuery,
    tasksQuery,
  };
}
