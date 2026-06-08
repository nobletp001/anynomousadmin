import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

function logoutAdmin() {
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_user");
  sessionStorage.removeItem("admin_refresh_token");
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message || "An error occurred";
    const originalRequest = error.config;

    if (status === 401 && typeof window !== "undefined" && !originalRequest._retry) {
      const refreshToken = sessionStorage.getItem("admin_refresh_token");
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.data?.token) {
            sessionStorage.setItem("admin_token", data.data.token);
            if (data.data.refreshToken) {
              sessionStorage.setItem("admin_refresh_token", data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
            isRefreshing = false;
            return apiClient(originalRequest);
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
