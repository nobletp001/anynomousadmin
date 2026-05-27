import { authService } from "@/services/auth-service";

export const ADMIN_ROLES = ["super-admin", "admin", "task-officer", "accountant"] as const;

export const authQueryKey = ["auth-user"] as const;

export const authQueryFn = async () => {
  const token = localStorage.getItem("admin_token");
  if (!token) return null;

  try {
    const response = await authService.getMe();
    if (response.success && ADMIN_ROLES.includes(response.data.user.role as any)) {
      localStorage.setItem("admin_user", JSON.stringify(response.data.user));
      return response.data.user;
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return null;
  } catch {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return null;
  }
};
