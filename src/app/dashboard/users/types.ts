export interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  disabled: boolean;
  withdrawalDisabled: boolean;
  taskDisabled: boolean;
  whatsappNumber?: string | null;
  emailVerified?: boolean;
  emailVerificationExpiresAt?: string | null;
  whatsappVerified?: boolean;
}

export type SignupPurpose = "task_creation" | "perform_tasks";

export interface NewUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  accountType: "task" | "business" | string;
  signupPurpose: SignupPurpose;
  emailVerified: boolean;
  emailVerificationExpiresAt: string | null;
  whatsappVerified: boolean;
  createdAt: string;
  disabled: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface AdminAction {
  id: number;
  username: string;
  actionType: "warning" | "deducted" | "additional" | "strike" | "not_supported";
  message: string;
  amount: number;
  referenceId: string;
  createdAt: string;
}
