import React from "react";
import { ListChecks } from "lucide-react";
import { TokenBadge } from "./Helpers";

interface TaskCompletionsListProps {
  taskBreakdown: any[];
  reversingId: number | null;
  actionDisabled: boolean;
  handleReverseSubmission: (taskId: number, subId: number) => void;
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function TaskCompletionsList({
  taskBreakdown,
  reversingId,
  actionDisabled,
  handleReverseSubmission,
}: TaskCompletionsListProps) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <ListChecks className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-350">
          Task Completions ({taskBreakdown.length})
        </span>
      </div>
      {taskBreakdown.length === 0 ? (
        <p className="text-xs text-zinc-500 py-1">No approved task submissions.</p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {taskBreakdown.map((t) => (
            <div
              key={t.submissionId}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <TokenBadge status={t.tokenStatus} />
                <span className="text-xs text-zinc-300 truncate">{t.taskTitle}</span>
                {t.isDouble && (
                  <span className="px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    Double
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-zinc-100">{fmt2(t.amount)}</span>
                {t.tokenStatus !== "invalid" && (
                  <button
                    onClick={() => handleReverseSubmission(t.taskId, t.submissionId)}
                    disabled={reversingId === t.submissionId || actionDisabled}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    {reversingId === t.submissionId ? "Reversing..." : "Reverse"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
