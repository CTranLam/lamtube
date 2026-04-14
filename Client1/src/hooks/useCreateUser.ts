import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/admin";
import { useState } from "react";
import type { ApiResponse, UserSummary } from "../types/auth";

type CreateUserPayload = {
  email: string;
  fullname: string;
  password: string;
  role: string;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<
    ApiResponse<UserSummary>,
    unknown,
    CreateUserPayload
  >({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      const maybeAny = err as { response?: { data?: { message?: string } } };
      const serverMessage =
        maybeAny.response?.data?.message || "Có lỗi xảy ra khi tạo người dùng";
      setError(serverMessage);
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    setError,
  };
};
