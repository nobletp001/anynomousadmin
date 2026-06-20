import { Task } from "./types";

interface BookedSlotTask {
  bookedSlotCount?: number;
  bookedSlotsCount?: number;
  reservedSlotCount?: number;
  secureSpotBookedCount?: number;
  submissionCount?: number;
}

export const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: "bg-green-500/10 text-green-400 border-green-500/20",
  tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  x: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  instagram: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
  other: "bg-zinc-800/60 text-zinc-400 border-zinc-700/60",
};

export function platformLabel(p: string) {
  return (
    ({ x: "X (Twitter)", youtube: "YouTube", other: "Other" } as Record<string, string>)[p] ??
    p.charAt(0).toUpperCase() + p.slice(1)
  );
}

export function taskTypeLabel(t: string) {
  const map: Record<string, string> = {
    follow: "Follow",
    like: "Like",
    comment: "Comment",
    subscribe: "Subscribe",
    share: "Share",
    "post-content": "Post Content",
    views: "Views",
    download: "Download",
    signup: "Sign Up",
    review: "Review",
    message: "Message",
    watch: "Watch",
    "use-app": "Use App",
    jetpot: "Jetpot",
  };
  return map[t] ?? t;
}

export function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function isExpired(task: Task) {
  if (task.lifeline || !task.timeline) return false;
  return new Date(task.timeline) < new Date();
}

export function isScheduled(task: Task) {
  if (!task.scheduledAt) return false;
  return new Date(task.scheduledAt) > new Date();
}

export function getBookedSlotCount(task: BookedSlotTask, fallbackCount = 0) {
  return (
    task.bookedSlotCount ??
    task.bookedSlotsCount ??
    task.reservedSlotCount ??
    task.secureSpotBookedCount ??
    task.submissionCount ??
    fallbackCount
  );
}

export function formatScheduledAt(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - taskDay.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === 2) return "2 Days Ago";
  if (diffDays === 3) return "3 Days Ago";
  if (diffDays === 4) return "4 Days Ago";
  if (diffDays === 5) return "5 Days Ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function groupByDate(tasks: Task[]): { label: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>();
  const order: string[] = [];
  for (const t of tasks) {
    const label = getDateLabel(t.createdAt);
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(t);
  }
  return order.map((label) => ({ label, tasks: map.get(label)! }));
}
