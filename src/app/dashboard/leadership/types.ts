export interface LeaderboardItem {
  username: string;
  name: string;
  tasksCompleted: number;
  amountEarned: number;
  averageTimeTaken: number;
  averageRating: number;
  userRating: number;
  rank: number;
  bonusAwarded: string | null;
}

export interface LeadershipResponse {
  success: boolean;
  month: number;
  year: number;
  monthLabel: string;
  leaderboard: LeaderboardItem[];
}

export interface BreakdownItem {
  id: number;
  title: string;
  amount: number;
  rating: number | null;
  createdAt: string;
}

export interface AdjustmentItem {
  id: number;
  actionType: "additional" | "deducted";
  message: string;
  amount: number;
  createdAt: string;
}

export interface ReferralDetailItem {
  username: string;
  name: string;
  createdAt: string;
  overallApprovedCount: number;
  overallCleared: number;
  monthApprovedCount: number;
  monthCleared: number;
  pending: number;
}

export interface UserBreakdownResponse {
  success: boolean;
  user: { username: string; name: string };
  month: number;
  year: number;
  tasksCompleted: BreakdownItem[];
  adjustments: AdjustmentItem[];
  referrals: ReferralDetailItem[];
  summary: {
    taskEarnings: number;
    referralEarningsMonth: number;
    adminAdditions: number;
    adminDeductions: number;
    pendingReferralMoney: number;
    clearedReferralEarnings: number;
    totalForMonth: number;
  };
}
