import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { toast } from "sonner";
import { TasksResponse } from "../types";

interface TasksMutationCallbacks {
  onDeleteSuccess: () => void;
  onDeleteAllSuccess: () => void;
}

export function useTasksMutations(callbacks: TasksMutationCallbacks) {
  const queryClient = useQueryClient();

  const deleteTask = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/tasks/${id}`) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      callbacks.onDeleteSuccess();
    },
  });

  const deleteAllTasks = useMutation({
    mutationFn: () => apiClient.delete("/admin/tasks/all") as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      callbacks.onDeleteAllSuccess();
    },
  });

  const togglePinTask = useMutation({
    mutationFn: ({ id, isPinned }: { id: number; isPinned: boolean }) =>
      apiClient.patch(`/admin/tasks/${id}`, { isPinned }) as any,
    onMutate: async ({ id, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-tasks"] });
      const previous = queryClient.getQueriesData<TasksResponse>({ queryKey: ["admin-tasks"] });
      queryClient.setQueriesData<TasksResponse>({ queryKey: ["admin-tasks"] }, (old) => {
        if (!old) return old;
        const tasks = old.data.map((task) => (task.id === id ? { ...task, isPinned } : task));
        const pinned = tasks.filter((task) => task.isPinned);
        const rest = tasks.filter((task) => !task.isPinned);
        return { ...old, data: [...pinned, ...rest], pinnedCount: pinned.length };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error("Failed to update pin — reverted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
    },
  });

  const sendOpenWindowReminders = useMutation({
    mutationFn: (id: number) => apiClient.post(`/admin/tasks/${id}/reminders/open-window`, {}) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
    },
  });

  return {
    deleteTask,
    deleteAllTasks,
    togglePinTask,
    sendOpenWindowReminders,
  };
}
