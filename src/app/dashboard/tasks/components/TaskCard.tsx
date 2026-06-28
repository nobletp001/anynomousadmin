import React from "react";
import {
  Trash2,
  UserCircle2,
  Coins,
  Users,
  Infinity as InfinityIcon,
  Calendar,
  ChevronRight,
  Share2,
  Pin,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { Task } from "../types";
import {
  PLATFORM_COLORS,
  platformLabel,
  taskTypeLabel,
  formatAmount,
  formatDate,
  isExpired,
  isScheduled,
  formatScheduledAt,
  getBookedSlotCount,
} from "../utils";

interface TaskCardProps {
  task: Task;
  canManage: boolean;
  onClick: () => void;
  onDeleteClick: () => void;
  onPinClick?: () => void;
}

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  (typeof window !== "undefined"
    ? window.location.origin.replace(":3001", ":3000").replace("admin.", "")
    : "http://localhost:3000");

export function TaskCard({ task, canManage, onClick, onDeleteClick, onPinClick }: TaskCardProps) {
  const progress =
    task.numberOfUsersNeeded > 0 ? Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100)) : 0;
  const expired = isExpired(task);
  const scheduled = isScheduled(task);
  const bookedSlotCount = getBookedSlotCount(task);
  const collectsTargetUsername =
    Boolean(task.collectUserName) ||
    Boolean(task.collect_username) ||
    Boolean(task.collectedUserName) ||
    Boolean(task.collectedUsername);
  const targetUsername = (task.targetUsername || task.target_username || task.targetUserName || "").trim();

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${FRONTEND_URL}/task/${task.id}`;
    const text = `Earn ₦${task.amount.toLocaleString()} — ${task.title}\n\nComplete this quick ${platformLabel(task.targetPlatform)} campaign on PayFluence to earn ₦${task.amount.toLocaleString()} instantly!\n\n👉 ${url}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Earn ₦${task.amount.toLocaleString()} — ${task.title}`,
          text: text,
          url: url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("Frontend task link and details copied to clipboard!");
      });
    }
  };

  const handleCopyTargetUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetUsername) return;
    navigator.clipboard.writeText(targetUsername).then(() => {
      alert("Target username copied to clipboard!");
    });
  };

  return (
    <div
      onClick={onClick}
      className="group relative backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 shadow-xl hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
    >
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        <button
          onClick={handleShareClick}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Share2 className="w-4 h-4" />
        </button>
        {canManage && onPinClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinClick();
            }}
            className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? "text-amber-400 bg-amber-500/10 opacity-100" : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100"}`}
          >
            <Pin className="w-4 h-4" />
          </button>
        )}
        {canManage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Creator fingerprint & Pin Status */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/40 w-fit">
          <UserCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="text-[10px] font-bold text-purple-300 tracking-wide">@{task.createdBy}</span>
        </div>
        {task.isPinned && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
            <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-[9px] font-extrabold text-amber-300 tracking-wider">PINNED</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3 pr-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[task.targetPlatform] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
            >
              {platformLabel(task.targetPlatform)}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {taskTypeLabel(task.taskType)}
            </span>
            {scheduled ? (
              <Badge variant="warning" dot>
                Scheduled
              </Badge>
            ) : (
              <Badge variant={task.status === "active" ? (expired ? "warning" : "success") : "default"} dot>
                {expired ? "Expired" : task.status}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2">{task.title}</h3>
          {scheduled && task.scheduledAt && (
            <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              Releases {formatScheduledAt(task.scheduledAt)}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-550 line-clamp-2 mb-4">{task.description}</p>

      {(collectsTargetUsername || targetUsername) && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-purple-300">Target Username</p>
            <p className="truncate text-xs font-bold text-zinc-100">{targetUsername || "Collect from user"}</p>
          </div>
          {targetUsername && (
            <button
              type="button"
              onClick={handleCopyTargetUsername}
              className="shrink-0 rounded-lg border border-purple-400/20 bg-zinc-950/40 p-1.5 text-purple-200 transition-colors hover:border-purple-300/40 hover:bg-purple-500/20"
              title="Copy target username"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-500">Progress</span>
          <span className="font-semibold text-zinc-300">
            {task.approvedCount} / {task.numberOfUsersNeeded}
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : "bg-purple-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-3 mt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <Coins className="w-3 h-3" />
            {formatAmount(task.amount)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {bookedSlotCount === null
              ? "— slots booked"
              : `${bookedSlotCount} slot${bookedSlotCount === 1 ? "" : "s"} booked`}
          </span>
        </div>
        <div className={`flex items-center gap-1 ${expired ? "text-red-400" : "text-zinc-500"}`}>
          {task.lifeline ? (
            <span className="flex items-center gap-1 text-violet-400">
              <InfinityIcon className="w-3 h-3" />
              No expiry
            </span>
          ) : task.timeline ? (
            <>
              <Calendar className="w-3 h-3" />
              {formatDate(task.timeline)}
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end mt-3">
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
      </div>
    </div>
  );
}
