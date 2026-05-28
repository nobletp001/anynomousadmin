import React from "react";
import { Trash2, UserCircle2, Coins, Users, Infinity as InfinityIcon, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { Task } from "../types";
import {
  PLATFORM_COLORS,
  platformLabel,
  taskTypeLabel,
  formatAmount,
  formatDate,
  isExpired,
} from "../utils";

interface TaskCardProps {
  task: Task;
  canManage: boolean;
  onClick: () => void;
  onDeleteClick: () => void;
}

export function TaskCard({ task, canManage, onClick, onDeleteClick }: TaskCardProps) {
  const progress =
    task.numberOfUsersNeeded > 0 ? Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100)) : 0;
  const expired = isExpired(task);

  return (
    <div
      onClick={onClick}
      className="group relative backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 shadow-xl hover:border-purple-500/30 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
    >
      {canManage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Creator fingerprint */}
      <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/40 w-fit">
        <UserCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
        <span className="text-[10px] font-bold text-purple-300 tracking-wide">@{task.createdBy}</span>
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
            <Badge variant={task.status === "active" ? (expired ? "warning" : "success") : "default"} dot>
              {expired ? "Expired" : task.status}
            </Badge>
          </div>
          <h3 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2">{task.title}</h3>
        </div>
      </div>

      <p className="text-xs text-zinc-550 line-clamp-2 mb-4">{task.description}</p>

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
            {task.submissionCount} submitted
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
