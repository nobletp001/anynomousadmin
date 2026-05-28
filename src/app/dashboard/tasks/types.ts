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
  createdBy: string;
  createdAt: string;
  submissionCount: number;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export type StatusFilter = "all" | "active" | "completed" | "paused";
