export const TASK_TYPES = [
  { value: "follow", label: "Follow (Follow an account)" },
  { value: "like", label: "Like (Like a post or page)" },
  { value: "comment", label: "Comment (Comment on a post)" },
  { value: "subscribe", label: "Subscribe (Subscribe to a channel)" },
  { value: "share", label: "Share (Share a post)" },
  { value: "post-content", label: "Post Content (Post on your profile/status)" },
  { value: "views", label: "Views (Get views on a post)" },
  { value: "download", label: "Download (Download an app or file)" },
  { value: "signup", label: "Sign Up (Register / create account)" },
  { value: "review", label: "Review (Leave a rating or review)" },
  { value: "message", label: "Message (Chat or DM someone)" },
  { value: "watch", label: "Watch (Watch a video to completion)" },
  { value: "use-app", label: "Use App (Use a feature or service)" },
  { value: "jetpot", label: "Jetpot (Bring buyers / sales referral)" },
];

export const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export const TIMELINE_OPTIONS = [
  ...Array.from({ length: 48 }, (_, i) => ({
    label: i === 0 ? "1 hour" : `${i + 1} hours`,
    ms: (i + 1) * HOUR_MS,
  })),
  { label: "3 days", ms: 3 * DAY_MS },
  { label: "5 days", ms: 5 * DAY_MS },
  { label: "6 days", ms: 6 * DAY_MS },
  { label: "7 days", ms: 7 * DAY_MS },
];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const MAX_IMAGES = 5;

export interface AudienceFilter {
  gender: string[];
  employmentStatus: string[];
  educationLevel: string[];
  state: string[];
  minAge: string;
  maxAge: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  caption: string | null;
  banner: string | null;
  link: string | null;
  instructions: string | null;
  timeline: string | null;
  lifeline: boolean;
  numberOfUsersNeeded: number;
  amount: number;
  taskType: string;
  targetPlatform: string;
  adminContact: string | null;
  status: string;
  approvedCount: number;
  bookedSlotCount?: number;
  bookedSlotsCount?: number;
  slotBookedCount?: number;
  slotBookingsCount?: number;
  reservedSlotCount?: number;
  secureSpotBookedCount?: number;
  submissionCount?: number;
  createdBy: string;
  assignedOfficer: string | null;
  proofType?: string | null;
  acceptText?: boolean | null;
  textLabel?: string | null;
  acceptNumber?: boolean | null;
  numberLabel?: string | null;
  acceptMultipleImages?: boolean | null;
  targetCount?: number | string | null;
  maxPerHour?: number | string | null;
  targetAudience?: string | null;
  images?: string | null;
  prompts?: string | null;
  requirePromptSelection?: boolean;
  marketingText?: string | null;
  isTobeIncludereferralCount?: boolean | null;
  scheduledAt?: string | null;
  isPinned?: boolean;
  collectUserName?: boolean | null;
  targetUsername?: string | null;
  isSecureSpotTask?: boolean;
  secureSpotIntervalType?: string | null;
  secureSpotInterval?: number | null;
  secureSpotConstantDelay?: number | null;
  additionalSlots?: number | null;
  blockSameDevice?: boolean;
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
}

export interface FraudAlert {
  id: number;
  username: string;
  alertType: string;
  severity: string;
  description: string;
  metadata: string | null;
  resolved: boolean;
  createdAt: string;
}

export interface ImageCollisionMatch {
  submissionId: number;
  taskId: number;
  taskTitle: string;
  username: string;
  proof: string;
  proofType: string;
  status: string;
  createdAt: string;
  ipAddress: string | null;
  deviceFingerprint: string | null;
}

export interface Submission {
  id: number;
  taskId: number;
  username: string;
  proof: string;
  proofType: string;
  textResponse: string | null;
  numberResponse: string | null;
  status: string;
  rejectionReason: string | null;
  deductedAmount: number;
  createdAt: string;
  user: UserInfo | null;
  userBalance: number;
  rating?: number | null;
  feedback?: string | null;
  ipAddress?: string | null;
  deviceId?: string | null;
  selectedPrompt?: string | null;
  deviceFingerprint?: string | null;
  imageHash?: string | null;
  fraudAlerts?: FraudAlert[];
  userTaskStats?: {
    total: number;
    approved: number;
    rejected: number;
    currentCorrections: number;
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
    totalStars: number;
    revisions: number;
  };
}

export interface SecuredSpot {
  id: number;
  taskId: number;
  username: string;
  name: string | null;
  whatsappNumber: string | null;
  whatsappVerified: boolean;
  securedAt: string;
  eligibleAt: string;
  status: string;
  timeLeftMs: number;
  minutesLeft: number;
  isEligible: boolean;
}

export interface SubmissionsResponse {
  success: boolean;
  data: {
    task: Task;
    submissions: Submission[];
  };
}

export interface RejectModal {
  subId: number;
  username: string;
  balance: number;
  mode: "reject" | "correction";
}
