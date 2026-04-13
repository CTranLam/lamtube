import type { UserProfileDetail } from "../types/channel";
import { getMyProfile } from "../api/channel";
import { useQuery } from "@tanstack/react-query";

export const useMyProfile = (
  enabled: boolean = true,
  userEmail?: string | null,
) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery<
    UserProfileDetail,
    Error
  >({
    queryKey: ["myProfile", userEmail ?? null],
    queryFn: getMyProfile,
    enabled: enabled && Boolean(userEmail),
    retry: false,
    staleTime: 5 * 60 * 1000, //Giữ data trong 5 phút để tránh gọi API quá nhiều
  });

  return {
    userData: data ?? null,
    isLoading: isLoading || (enabled && isFetching), // isLoading chỉ true ở lần load đầu tiên
    error: error ?? null,
    refresh: refetch,
  };
};
