export interface TaskBreakdownItem {
  submissionId: number;
  taskId: number;
  taskTitle: string;
  amount: number;
  tokenStatus: "valid" | "legacy" | "invalid";
  approvedAt: string;
  category?: "withdrawing" | "remaining";
}

export interface ReferralBreakdownItem {
  referredUsername: string;
  referredName: string | null;
  approvedCount: number;
  earned: number;
  pending: number;
  recentTasks: { taskTitle: string; amount: number; date: string }[];
  category?: "withdrawing" | "remaining";
}

export interface AdminAdjustment {
  id: number;
  actionType: string;
  amount: number;
  message: string;
  appliedBy: string | null;
  createdAt: string;
}

export interface FraudAlert {
  id: number;
  alertType: string;
  severity: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

export interface PayoutBreakdown {
  claim: {
    id: number;
    username: string;
    amount: number;
    microAmount: number;
    referralAmount: number;
    status: string;
    createdAt: string;
    microEarningsSnapshot: number | null;
    referralEarningsSnapshot: number | null;
    availableBalanceSnapshot: number | null;
  };
  user: { username: string; name: string; email: string | null; disabled: boolean; violationDebt: number } | null;
  bankDetails: { bankName: string; accountNumber: string; accountName: string; whatsappNumber: string | null } | null;
  balance: {
    totalMicroEarnings: number;
    clearedReferralEarnings: number;
    pendingReferralMoney: number;
    totalEarnings: number;
    totalClaimed: number;
    reviewMoney: number;
    availableBalance: number;
    adminAdditions: number;
    adminDeductions: number;
  };
  taskBreakdown: TaskBreakdownItem[];
  rejectedSubmissions: {
    submissionId: number;
    taskId: number;
    taskTitle: string;
    deductedAmount: number;
    rejectionReason: string | null;
    updatedAt: string;
  }[];
  referralBreakdown: ReferralBreakdownItem[];
  adminAdjustments: AdminAdjustment[];
  previousPayouts: {
    id: number;
    amount: number;
    microAmount: number;
    referralAmount: number;
    paidAt: string | null;
    paidBy: string | null;
  }[];
  fraudAlerts: FraudAlert[];
  verification: {
    invalidTokenCount: number;
    claimAmount: number;
    effectiveAvailable: number;
    checksOut: boolean;
    warning: string | null;
  };
}

export interface BankDetail {
  accountName: string;
  accountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

export interface PayoutClaim {
  id: number;
  username: string;
  amount: number;
  status: string;
  paidBy: string | null;
  paidByRole: string | null;
  paidAt: string | null;
  createdAt: string;
  bankDetail: BankDetail | null;
}
