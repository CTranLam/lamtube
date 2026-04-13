import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/admin";
import type { ApiResponse, UserSummary } from "../types/auth";

type UpdatePayload = {
  userId: number;
  payload: Partial<{
    fullname: string;
    role: string;
    password: string;
    bio: string;
    avatarUrl: string;
  }>;
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<UserSummary>,
    unknown,
    UpdatePayload
  >({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUser", vars.userId] });
    },
    onError: (err) => {
      console.error("Update user failed", err);
    },
  });

  return {
    update: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error as unknown,
  } as const;
};
