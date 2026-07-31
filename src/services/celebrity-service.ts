import { apiClient } from "./api-client";

export type CelebrityApplication = {
  id: number;
  username: string;
  fullName: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  category: string;
  country: string;
  state?: string | null;
  languages?: string | null;
  bio: string;
  status: "pending" | "approved" | "rejected";
  googleMeetLink?: string | null;
  meetingScheduledAt?: string | null;
  meetingStatus?: "pending" | "scheduled" | "accepted" | "rejected" | "completed";
  rejectionReason?: string | null;
  referralUsername?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationMethod?: "meeting_review" | "manual_username" | string | null;
  createdAt: string;
  updatedAt: string;
  verificationDocuments?: Array<{
    type: "government_id" | "selfie";
    fileName: string;
    mimeType: string;
    dataUrl: string;
  }>;
};

export type AdminUserDetail = {
  user?: {
    username?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
  };
  profile?: Record<string, unknown> | null;
  bankDetails?: { whatsappNumber?: string | null } | null;
};

export type CelebrityService = {
  id: number;
  sellerUsername: string;
  platform: string;
  type: string;
  url: string;
  visibility: "public" | "private";
  terms: string;
  prices: Array<{ duration: string; amount: string }>;
  status: "pending" | "approved" | "rejected" | "disabled";
  createdAt?: string;
  updatedAt?: string;
};

export type CelebrityOrder = {
  id: number;
  buyerUsername: string;
  sellerUsername: string;
  serviceId: number;
  selectedPrice: { duration: string; amount: string };
  amount: number;
  sourceUrl: string;
  note: string;
  status: "requested" | "active" | "rejected" | "monitoring" | "completed" | "disputed";
  performedAt?: string | null;
  autoConfirmAt?: string | null;
  disputedAt?: string | null;
  disputedBy?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolution?: string | null;
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type ApiResponse<T> = { success: boolean; data: T; error?: string };

export async function listCelebrityApplications(status = "pending") {
  return apiClient.get("/admin/celebrity/applications", { params: { status } }) as Promise<
    ApiResponse<CelebrityApplication[]>
  >;
}

export async function getCelebrityApplicantDetail(username: string) {
  return apiClient.get(`/admin/users/${encodeURIComponent(username)}`) as Promise<ApiResponse<AdminUserDetail>>;
}

export async function reviewCelebrityApplication(
  id: number,
  action: "approve" | "reject",
  data: { googleMeetLink?: string; meetingScheduledAt?: string; rejectionReason?: string; referralUsername?: string }
) {
  return apiClient.post(`/admin/celebrity/applications/${id}/${action}`, data) as Promise<
    ApiResponse<CelebrityApplication>
  >;
}

export async function scheduleCelebrityApplication(
  id: number,
  data: { googleMeetLink: string; meetingScheduledAt: string; referralUsername?: string }
) {
  return apiClient.post(`/admin/celebrity/applications/${id}/schedule`, data) as Promise<
    ApiResponse<CelebrityApplication>
  >;
}

function idempotencyKey(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString(36);
  return `${prefix}:${random}`;
}

export async function directVerifyCelebrity(data: { username: string; category?: string; country?: string }) {
  return apiClient.post("/admin/celebrity/applications/direct-verify", data, {
    headers: { "Idempotency-Key": idempotencyKey("admin-celebrity-direct-verify") },
  }) as Promise<ApiResponse<CelebrityApplication>>;
}

export async function attachCelebrityReferral(data: { celebrityUsername: string; referralUsername: string }) {
  return apiClient.post("/admin/celebrity/applications/attach-referral", data) as Promise<
    ApiResponse<CelebrityApplication>
  >;
}

export async function listCelebrityServices(status?: CelebrityService["status"] | "") {
  return apiClient.get("/admin/celebrity/services", { params: status ? { status } : undefined }) as Promise<
    ApiResponse<CelebrityService[]>
  >;
}

export async function reviewCelebrityService(id: number, action: "approve" | "reject" | "enable" | "disable") {
  return apiClient.post(`/admin/celebrity/services/${id}/${action}`, {}) as Promise<ApiResponse<CelebrityService>>;
}

export async function listCelebrityDisputes() {
  return apiClient.get("/admin/celebrity/orders/disputes", { params: { page: 1, limit: 25 } }) as Promise<
    ApiResponse<PaginatedResponse<CelebrityOrder>>
  >;
}

export async function resolveCelebrityDispute(id: number, action: "complete" | "reject") {
  return apiClient.post(`/admin/celebrity/orders/${id}/resolve/${action}`, {}) as Promise<ApiResponse<CelebrityOrder>>;
}
