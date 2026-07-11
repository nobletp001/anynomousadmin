import { apiClient } from "@/services/api-client";

export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  const response = await apiClient.request({
    url: path.replace(/^\/api(?=\/)/, ""),
    method,
    data: options?.body ? JSON.parse(options.body as string) : undefined,
  });
  return response as T;
}

export function getImagesList(proof: string): string[] {
  if (!proof) return [];
  if (proof.startsWith("[")) {
    try {
      return JSON.parse(proof);
    } catch {
      return [proof];
    }
  }
  return [proof];
}

export function getDownloadUrl(url: string) {
  if (url.includes("cloudinary.com") && url.includes("image/upload/")) {
    return url.replace("image/upload/", "image/upload/fl_attachment/");
  }
  return url;
}

export function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
