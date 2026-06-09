import React from "react";
import { Badge } from "@/components/ui";
import { ArrowLeft, Download, ExternalLink, FileSpreadsheet } from "lucide-react";
import { Task } from "../types";
import { formatAmount } from "../utils";

interface TaskDetailHeaderProps {
  task: Task;
  submissionsCount: number;
  onBack: () => void;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  onEditClick: () => void;
  onToggleStatusClick: () => void;
  toggleStatusPending: boolean;
}

export function TaskDetailHeader({
  task,
  submissionsCount,
  onBack,
  onDownloadPDF,
  onDownloadExcel,
  onEditClick,
  onToggleStatusClick,
  toggleStatusPending,
}: TaskDetailHeaderProps) {
  const progress = Math.min(100, Math.round((task.approvedCount / task.numberOfUsersNeeded) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Submissions</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Review and action user proof of task completion</p>
        </div>
      </div>

      <div className="backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={task.status === "active" ? "success" : "default"} dot>
                {task.status}
              </Badge>
              <span className="text-xs text-zinc-500 capitalize">{task.taskType}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500 capitalize">{task.targetPlatform}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{task.title}</h2>
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
          </div>

          <div className="flex items-center gap-3 self-start shrink-0 flex-wrap">
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF Report
            </button>
            <button
              onClick={onDownloadExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel
            </button>
            <button
              onClick={onEditClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white transition-colors"
            >
              Edit Task
            </button>
            <button
              onClick={onToggleStatusClick}
              disabled={toggleStatusPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                task.status === "active"
                  ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
              }`}
            >
              {toggleStatusPending ? "Updating..." : task.status === "active" ? "Close Task" : "Re-open Task"}
            </button>
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View target
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-zinc-800/60">
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Reward</p>
            <p className="text-sm font-bold text-emerald-400">{formatAmount(task.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Capacity</p>
            <p className="text-sm font-bold text-zinc-200">
              {task.approvedCount} / {task.numberOfUsersNeeded}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Deadline</p>
            <p className="text-sm font-bold text-zinc-200">
              {task.timeline ? new Date(task.timeline).toLocaleDateString() : "No Expiry / Lifeline"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Submissions</p>
            <p className="text-sm font-bold text-zinc-200">{submissionsCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-650 uppercase tracking-wider font-semibold mb-1">Officer</p>
            <p className="text-sm font-bold text-zinc-200 truncate" title={task.assignedOfficer || "Auto"}>
              @{task.assignedOfficer || "Auto"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-550">Completion</span>
            <span className="font-semibold text-zinc-400">{progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : "bg-purple-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
