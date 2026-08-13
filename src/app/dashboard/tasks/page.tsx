"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, AlertCircle, Plus, Trash2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useTasksQueries } from "./hooks/useTasksQueries";
import { useTasksMutations } from "./hooks/useTasksMutations";
import { useTasksState } from "./hooks/useTasksState";
import { TaskCard } from "./components/TaskCard";
import { DeleteTaskModal } from "./components/DeleteTaskModal";
import { DeleteAllTasksModal } from "./components/DeleteAllTasksModal";
import { StatusTabs } from "./components/StatusTabs";
import { groupByDate } from "./utils";
import { toast } from "sonner";

export default function TasksPage() {
  const router = useRouter();
  const state = useTasksState();
  const { userQuery, tasksQuery } = useTasksQueries(
    state.page,
    state.statusFilter,
    state.ownerFilter,
    state.submittedSearch
  );

  const callbacks = {
    onDeleteSuccess: () => state.setConfirmDelete(null),
    onDeleteAllSuccess: () => state.setConfirmDeleteAll(false),
  };
  const { deleteTask, deleteAllTasks, togglePinTask, sendOpenWindowReminders } = useTasksMutations(callbacks);

  const user = userQuery.data;
  const canManage = user?.role === "super-admin" || user?.role === "admin";
  const isSuperAdmin = user?.role === "super-admin";

  const allTasks = tasksQuery.data?.data ?? [];
  const pinnedCount = tasksQuery.data?.pinnedCount ?? allTasks.filter((task) => task.isPinned).length;
  const pinnedTasks = allTasks.slice(0, pinnedCount);
  const normalTasks = allTasks.slice(pinnedCount);
  const searchTokens = state.submittedSearch
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
  const titleMatchesSearch = (title: string) =>
    searchTokens.length === 0 || searchTokens.some((token) => title.toLowerCase().includes(token));
  const filtered = searchTokens.length > 0 ? normalTasks.filter((task) => titleMatchesSearch(task.title)) : normalTasks;
  const totalTasks = tasksQuery.data?.total ?? 0;
  const pageSize = tasksQuery.data?.limit ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize));
  const hasMore = Boolean(tasksQuery.data?.hasMore);
  const displayTotalPages = Math.max(totalPages, state.page + (hasMore ? 1 : 0));
  const canGoNext = hasMore || state.page < totalPages;
  const showPagination = state.page > 1 || canGoNext || totalPages > 1;
  const pageNumbers = Array.from({ length: displayTotalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === displayTotalPages || Math.abs(page - state.page) <= 2
  );
  const groups = groupByDate(filtered);
  const emptyMessage = state.submittedSearch
    ? `No tasks found for "${state.submittedSearch}"`
    : state.ownerFilter === "client"
      ? "No client-owned tasks"
      : state.ownerFilter === "admin"
        ? "No admin-created tasks"
        : state.statusFilter === "all"
          ? "No tasks yet"
          : `No ${state.statusFilter} tasks`;

  const counts = {
    all: state.statusFilter === "all" ? totalTasks : 0,
    active: state.statusFilter === "active" ? totalTasks : 0,
    completed: state.statusFilter === "completed" ? totalTasks : 0,
    paused: state.statusFilter === "paused" ? totalTasks : 0,
  };

  const isLoading = tasksQuery.isLoading || userQuery.isLoading;
  const isError = tasksQuery.isError || userQuery.isError;
  const setStatusFilter = (filter: typeof state.statusFilter) => {
    state.setStatusFilter(filter);
    state.setPage(1);
  };
  const setOwnerFilter = (filter: typeof state.ownerFilter) => {
    state.setOwnerFilter(filter);
    state.setPage(1);
  };
  const submitSearch = () => {
    state.setSubmittedSearch(state.searchInput.trim());
    state.setStatusFilter("all");
    state.setPage(1);
  };
  const clearSearch = () => {
    state.setSearchInput("");
    state.setSubmittedSearch("");
    state.setPage(1);
  };
  const sendReminderForTask = (task: { id: number }) => {
    sendOpenWindowReminders.mutate(task.id, {
      onSuccess: (res: any) => {
        const queued = Number(res?.data?.queued ?? 0);
        const eligible = Number(res?.data?.eligible ?? queued);
        toast.success(
          `Reminder queued for ${queued} user${queued === 1 ? "" : "s"} with an open window.${
            eligible === 0 ? " No eligible open windows were found." : ""
          }`
        );
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to send reminders.");
      },
    });
  };

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
            {isSuperAdmin && totalTasks > 0 && (
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
        <StatusTabs statusFilter={state.statusFilter} setStatusFilter={setStatusFilter} counts={counts} />
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={state.searchInput}
            onChange={(e) => state.setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            placeholder="Search tasks by title..."
            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 pl-9 pr-3 text-sm font-semibold text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={state.ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value as typeof state.ownerFilter)}
            className="h-10 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 text-xs font-bold text-zinc-200 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
          >
            <option value="all">All owners</option>
            <option value="client">Client-owned</option>
            <option value="admin">Admin-created</option>
          </select>
          {state.submittedSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-800 px-3 text-xs font-bold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={submitSearch}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-purple-500 px-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-purple-400"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>
      </div>

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
      ) : pinnedTasks.length === 0 && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center backdrop-blur-md bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-zinc-600" />
          <p className="text-zinc-400 text-sm font-medium">{emptyMessage}</p>
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
          {pinnedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
                  Quick Access (Pinned)
                </span>
                <div className="flex-1 h-px bg-amber-500/20" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {pinnedTasks.map((task) => (
                  <div key={`pinned-${task.id}`} className="min-w-[320px] max-w-[360px] flex-shrink-0">
                    <TaskCard
                      task={task}
                      canManage={canManage}
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      onDeleteClick={() => state.setConfirmDelete({ id: task.id, title: task.title })}
                      onPinClick={() => togglePinTask.mutate({ id: task.id, isPinned: !task.isPinned })}
                      onReminderClick={() => sendReminderForTask(task)}
                      reminderPending={
                        sendOpenWindowReminders.isPending && sendOpenWindowReminders.variables === task.id
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    onPinClick={() => togglePinTask.mutate({ id: task.id, isPinned: !task.isPinned })}
                    onReminderClick={() => sendReminderForTask(task)}
                    reminderPending={sendOpenWindowReminders.isPending && sendOpenWindowReminders.variables === task.id}
                  />
                ))}
              </div>
            </div>
          ))}

          {showPagination && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-zinc-800 pt-5">
              <p className="text-xs font-semibold text-zinc-500">
                Page {state.page} of {displayTotalPages} · {totalTasks} total task{totalTasks !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={state.page === 1}
                  onClick={() => state.setPage((page) => Math.max(1, page - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                {pageNumbers.map((page, index) => {
                  const previous = pageNumbers[index - 1];
                  const needsGap = previous !== undefined && page - previous > 1;
                  return (
                    <React.Fragment key={page}>
                      {needsGap && <span className="px-1 text-xs font-semibold text-zinc-600">...</span>}
                      <button
                        type="button"
                        onClick={() => state.setPage(page)}
                        className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-colors ${
                          state.page === page
                            ? "border-purple-500 bg-purple-500/15 text-purple-300"
                            : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() => state.setPage((page) => page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {state.confirmDeleteAll && (
        <DeleteAllTasksModal
          tasksCount={totalTasks}
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
