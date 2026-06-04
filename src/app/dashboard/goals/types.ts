export interface Goal {
  id: number;
  month: string;
  targetReferrals: number;
  targetReferralTasks: number;
  rewards: number[];
  encouragementText?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  username: string;
  name: string;
  email?: string;
  referralsCount: number;
  referralTasksCount: number;
  hasMetGoal: boolean;
  rank: number | null;
  rewardAmount: number;
}

export interface GoalWinnersResponse {
  goal: Goal;
  users: Competitor[];
  total: number;
  totalQualified: number;
  page: number;
  limit: number;
}
