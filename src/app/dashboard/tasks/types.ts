export interface Task {
  id: number;
  title: string;
  description: string;
  banner: string | null;
  timeline: string | null;
  lifeline: boolean;
  numberOfUsersNeeded: number;
  amount: number;
  taskType: string;
  targetPlatform: string;
  proofType: string;
  adminContact: string | null;
  status: string;
  approvedCount: number;
  bookedSlotCount?: number;
  bookedSlotsCount?: number;
  reservedSlotCount?: number;
  secureSpotBookedCount?: number;
  createdBy: string;
  createdAt: string;
  submissionCount: number;
  isTobeIncludereferralCount?: boolean | null;
  scheduledAt?: string | null;
  isPinned?: boolean;
  collectUserName?: boolean | null;
  targetUsername?: string | null;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export type StatusFilter = "all" | "active" | "completed" | "paused";
