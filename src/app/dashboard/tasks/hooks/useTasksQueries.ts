import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { StatusFilter, TasksResponse } from "../types";

const TASKS_PER_PAGE = 10;
const TASKS_SEARCH_PER_PAGE = 100;

export function useTasksQueries(page: number, statusFilter: StatusFilter, search: string) {
  const userQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const tasksQuery = useQuery<TasksResponse>({
    queryKey: ["admin-tasks", page, statusFilter, search],
    queryFn: () => {
      const statusParam = statusFilter === "all" ? "" : `&status=${encodeURIComponent(statusFilter)}`;
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const limit = search.trim() ? TASKS_SEARCH_PER_PAGE : TASKS_PER_PAGE;
      return apiClient.get(`/admin/tasks?page=${page}&limit=${limit}${statusParam}${searchParam}`) as any;
    },
  });

  return {
    userQuery,
    tasksQuery,
  };
}
