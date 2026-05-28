import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api-client";

export function useCreateTaskMutations() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const uploadImage = useMutation({
    mutationFn: ({ base64, mimeType }: { base64: string; mimeType: string }) =>
      apiClient.post("/admin/upload", { base64, mimeType }) as any,
  });

  const createTask = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post("/admin/tasks", body) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      router.push("/dashboard/tasks");
    },
  });

  return {
    uploadImage,
    createTask,
  };
}
