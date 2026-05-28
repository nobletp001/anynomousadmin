import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { User, UsersResponse } from "../types";

export function useUsersMutations(page: number) {
  const queryClient = useQueryClient();

  const updateFlags = useMutation({
    mutationFn: ({
      id,
      flags,
    }: {
      id: number;
      flags: Partial<Pick<User, "disabled" | "withdrawalDisabled" | "taskDisabled">>;
    }) => apiClient.patch(`/admin/users/${id}/flags`, flags) as any,
    onMutate: async ({ id, flags }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users", page] });
      const previous = queryClient.getQueryData<UsersResponse>(["admin-users", page]);
      queryClient.setQueryData<UsersResponse>(["admin-users", page], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((u) => {
            if (u.id !== id) return u;
            const next = { ...u, ...flags };
            if (flags.disabled) {
              next.withdrawalDisabled = true;
              next.taskDisabled = true;
            }
            return next;
          }),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["admin-users", page], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    updateFlags,
  };
}
