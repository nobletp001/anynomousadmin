import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { NewUser, UsersResponse } from "../types";

interface TopPerformer {
  username: string;
  name: string;
  tasksCount: number;
  averageRating: number;
}

export function useUsersQueries(
  page: number,
  search: string,
  selectedUser: string | null,
  activeTab: "all" | "new" | "tracking" | "gw"
) {
  const usersQuery = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search],
    queryFn: () => apiClient.get(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`) as any,
    enabled: activeTab === "all",
  });

  const gwQuery = useQuery<UsersResponse>({
    queryKey: ["admin-gw-users", page, search],
    queryFn: () =>
      apiClient.get(`/admin/users/gw-verified?page=${page}&limit=20&search=${encodeURIComponent(search)}`) as any,
    enabled: activeTab === "gw",
  });

  const newUsersQuery = useQuery<{
    success: boolean;
    data: NewUser[];
    total: number;
    page: number;
    limit: number;
    windowHours: number;
  }>({
    queryKey: ["admin-new-users", page],
    queryFn: () => apiClient.get(`/admin/users/new?page=${page}&limit=20`) as any,
    enabled: activeTab === "new",
    refetchInterval: activeTab === "new" ? 15000 : false,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-user-detail", selectedUser],
    queryFn: () => apiClient.get(`/admin/users/${selectedUser}`) as any,
    enabled: !!selectedUser,
  });

  const topUsersQuery = useQuery<{
    success: boolean;
    data: TopPerformer[];
  }>({
    queryKey: ["admin-top-performing-users"],
    queryFn: () => apiClient.get("/admin/users/top-performing") as any,
    enabled: activeTab === "all",
  });

  return {
    usersQuery,
    gwQuery,
    newUsersQuery,
    detailQuery,
    topUsersQuery,
  };
}
