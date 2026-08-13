import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { NewUser, SignupPurpose, UsersResponse } from "../types";

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
  activeTab: "all" | "new" | "tracking" | "gw",
  newUsersPurposeFilter: SignupPurpose | "all" = "all"
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
    hasMore?: boolean;
    windowHours: number;
    signupPurpose: SignupPurpose | "all";
  }>({
    queryKey: ["admin-new-users", page, newUsersPurposeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (newUsersPurposeFilter !== "all") params.set("signupPurpose", newUsersPurposeFilter);
      return apiClient.get(`/admin/users/new?${params.toString()}`) as any;
    },
    enabled: activeTab === "new",
    refetchInterval: activeTab === "new" && typeof document !== "undefined" && !document.hidden ? 60000 : false,
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
