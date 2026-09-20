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
  accountType?: string | null;
  signupPurpose?: SignupPurpose | string | null;
  registrationFeeWaived?: boolean;
  registrationPaymentStatus?: "free" | "paid" | "pending" | "rejected" | "not_paid" | "not_required";
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

export interface RegistrationPaymentReview {
  id: number;
  reference: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  email: string;
  username: string | null;
  intendedUsername: string | null;
  intendedName: string | null;
  intendedWhatsappNumber: string | null;
  providerResponse: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    receiptName?: string | null;
    receiptDataUrl?: string | null;
    payerPhone?: string | null;
    depositorName?: string | null;
    transferReference?: string | null;
    supportPhone?: string;
    submittedAt?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  userWhatsappNumber: string | null;
  userEmailVerified: boolean | null;
  userDisabled: boolean | null;
}

export interface EmailActivityItem {
  id: number;
  jobType: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  availableAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  payloadEmail: string | null;
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
