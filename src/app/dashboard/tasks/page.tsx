"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useTasksQueries } from "./hooks/useTasksQueries";
import { useTasksMutations } from "./hooks/useTasksMutations";
import { useTasksState } from "./hooks/useTasksState";
import { TaskCard } from "./components/TaskCard";
import { DeleteTaskModal } from "./components/DeleteTaskModal";
import { DeleteAllTasksModal } from "./components/DeleteAllTasksModal";
import { StatusTabs } from "./components/StatusTabs";
import { groupByDate } from "./utils";

export default function TasksPage() {
  const router = useRouter();
  const state = useTasksState();
  const { userQuery, tasksQuery } = useTasksQueries();

  const callbacks = {
    onDeleteSuccess: () => state.setConfirmDelete(null),
    onDeleteAllSuccess: () => state.setConfirmDeleteAll(false),
  };
  const { deleteTask, deleteAllTasks } = useTasksMutations(callbacks);

  const user = userQuery.data;
  const canManage = user?.role === "super-admin" || user?.role === "admin";
  const isSuperAdmin = user?.role === "super-admin";

  const allTasks = tasksQuery.data?.data ?? [];
  const filtered = state.statusFilter === "all" ? allTasks : allTasks.filter((t) => t.status === state.statusFilter);
  const groups = groupByDate(filtered);

  const counts = {
    all: allTasks.length,
    active: allTasks.filter((t) => t.status === "active").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    paused: allTasks.filter((t) => t.status === "paused").length,
  };

  const isLoading = tasksQuery.isLoading || userQuery.isLoading;
  const isError = tasksQuery.isError || userQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Tasks</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Social engagement &amp; referral tasks — click a card to review submissions
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            {isSuperAdmin && allTasks.length > 0 && (
              <Button
                variant="outline"
                size="md"
                onClick={() => state.setConfirmDeleteAll(true)}
                leftIcon={<Trash2 className="w-4 h-4 text-red-400" />}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                Delete All
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/dashboard/tasks/create")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Task
            </Button>
          </div>
        )}
      </div>

      {!isLoading && !isError && (
        <StatusTabs statusFilter={state.statusFilter} setStatusFilter={state.setStatusFilter} counts={counts} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="h-2 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-zinc-400 text-sm">Failed to load tasks</p>
          <Button variant="outline" size="sm" onClick={() => tasksQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-zinc-600" />
          <p className="text-zinc-400 text-sm font-medium">
            {state.statusFilter === "all" ? "No tasks yet" : `No ${state.statusFilter} tasks`}
          </p>
          {canManage && state.statusFilter === "all" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/dashboard/tasks/create")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ label, tasks }) => (
            <div key={label} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">{label}</span>
                <div className="flex-1 h-px bg-zinc-800/80" />
                <span className="text-[10px] font-semibold text-zinc-600 tabular-nums">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canManage={canManage}
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    onDeleteClick={() => state.setConfirmDelete({ id: task.id, title: task.title })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {state.confirmDeleteAll && (
        <DeleteAllTasksModal
          tasksCount={allTasks.length}
          isPending={deleteAllTasks.isPending}
          onClose={() => state.setConfirmDeleteAll(false)}
          onConfirm={() => deleteAllTasks.mutate()}
        />
      )}

      {state.confirmDelete && (
        <DeleteTaskModal
          title={state.confirmDelete.title}
          isPending={deleteTask.isPending}
          onClose={() => state.setConfirmDelete(null)}
          onConfirm={() => deleteTask.mutate(state.confirmDelete!.id)}
        />
      )}
    </div>
  );
}
