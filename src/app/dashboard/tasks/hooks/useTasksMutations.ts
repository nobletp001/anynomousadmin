import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

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

  return {
    deleteTask,
    deleteAllTasks,
  };
}
