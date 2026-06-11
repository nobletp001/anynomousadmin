import React from "react";
import { ListChecks, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDate } from "../utils";

interface UserTasksTableProps {
  tasksData: any;
  loadingTasks: boolean;
  taskPage: number;
  setTaskPage: React.Dispatch<React.SetStateAction<number>>;
  taskTotalPages: number;
}

function fmt2(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function UserTasksTable({
  tasksData,
  loadingTasks,
  taskPage,
  setTaskPage,
  taskTotalPages,
}: UserTasksTableProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">Task Submissions List</h3>
        </div>
        <span className="text-xs text-zinc-500 font-semibold">{tasksData ? tasksData.total : 0} submissions</span>
      </div>

      {loadingTasks ? (
        <div className="h-32 rounded bg-zinc-800/25 animate-pulse" />
      ) : !tasksData?.data?.length ? (
        <p className="text-xs text-zinc-500 py-6 text-center">No task submissions found for this user.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {tasksData.data.map((task: any) => (
                <tr key={task.id} className="hover:bg-zinc-800/10 transition">
                  <td className="py-3 px-4 font-medium text-zinc-200">{task.taskTitle}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-450"
                          : task.status === "rejected"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-zinc-200">
                    {task.status === "approved"
                      ? fmt2(task.earnedAmount ?? 0)
                      : task.status === "rejected" && task.deductedAmount > 0
                        ? `-${fmt2(task.deductedAmount)}`
                        : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-500">{formatDate(task.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Pagination */}
      {taskTotalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
          <span className="text-zinc-500">
            Page {taskPage} of {taskTotalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTaskPage((p) => p - 1)}
              disabled={taskPage === 1}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTaskPage((p) => p + 1)}
              disabled={taskPage >= taskTotalPages}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
