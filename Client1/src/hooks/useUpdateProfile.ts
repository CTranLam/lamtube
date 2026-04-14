import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile } from "../api/channel";
import { useAuth } from "./useAuth";
import type { UserProfileDetail, UserUpdateDTO } from "../types/channel";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const profileQueryKey = ["myProfile", user?.email ?? null] as const;

  const mutation = useMutation<void, Error, UserUpdateDTO>({
    mutationFn: (payload) => updateMyProfile(payload),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<UserProfileDetail | undefined>(
        profileQueryKey,
        (current) => {
          if (!current) return current;

          return {
            ...current,
            profile: {
              ...current.profile,
              fullName: variables.fullname ?? current.profile.fullName,
              bio: variables.bio ?? current.profile.bio,
              avatarUrl:
                variables.avatarUrl?.trim() || current.profile.avatarUrl,
            },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
    onError: (err) => {
      console.error("Update failed:", err.message);
    },
  });

  return {
    update: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
  } as const;
};
