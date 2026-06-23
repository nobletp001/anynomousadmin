import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_URL = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── CSRF ──────────────────────────────────────────────────────────────────────

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

function clearCsrfToken(): void {
  csrfToken = null;
  csrfTokenPromise = null;
}

async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get<{ csrfToken: string }>(`${API_URL}/api/csrf-token`, {
        withCredentials: true,
      })
      .then((res) => {
        csrfToken = res.data?.csrfToken || null;
        return csrfToken;
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
        return null;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

// ── Session helpers ───────────────────────────────────────────────────────────

function logoutAdmin() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_user");
  sessionStorage.removeItem("admin_refresh_token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// ── Request interceptor ───────────────────────────────────────────────────────

let isRefreshing = false;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const method = (config.method || "").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const token = await getCsrfToken();
      if (token) {
        if (typeof config.headers.set === "function") {
          config.headers.set("x-csrf-token", token);
        } else {
          (config.headers as Record<string, string>)["x-csrf-token"] = token;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────

const isCsrfError = (error: AxiosError): boolean => {
  if (error.response?.status !== 403) return false;
  const data = error.response.data as Record<string, unknown> | undefined;
  const errMsg = (data?.error as string | undefined) ?? "";
  return errMsg.toLowerCase().includes("csrf") || errMsg.toLowerCase().includes("invalid or missing");
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableRequestConfig | undefined;

    // Retry once on CSRF errors with a fresh token
    if (isCsrfError(error) && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      clearCsrfToken();
      const freshToken = await getCsrfToken();
      if (freshToken) {
        if (typeof originalConfig.headers?.set === "function") {
          (originalConfig.headers as { set: (k: string, v: string) => void }).set("x-csrf-token", freshToken);
        } else {
          (originalConfig.headers as Record<string, string>)["x-csrf-token"] = freshToken;
        }
        return apiClient.request(originalConfig);
      }
    }

    const status = error.response?.status;
    const message =
      ((error.response?.data as Record<string, unknown>)?.error as string | undefined) ||
      error.message ||
      "An error occurred";

    if (status === 401 && originalConfig && !originalConfig._retry) {
      const refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("admin_refresh_token") : null;

      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        originalConfig._retry = true;
        try {
          const res = await refreshClient.post<{ success: boolean; data?: { token?: string; refreshToken?: string } }>(
            "/auth/refresh",
            { refreshToken }
          );
          const newToken = (res as unknown as { data?: { token?: string; refreshToken?: string } }).data?.token;
          if (newToken) {
            sessionStorage.setItem("admin_token", newToken);
            const newRefresh = (res as unknown as { data?: { refreshToken?: string } }).data?.refreshToken;
            if (newRefresh) sessionStorage.setItem("admin_refresh_token", newRefresh);
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return apiClient.request(originalConfig);
          }
        } catch {
          // fall through to logout
        }
        isRefreshing = false;
      }
      logoutAdmin();
    }

    return Promise.reject(new Error(message));
  }
);
