import { useQuery } from "@tanstack/react-query";
import type { UserInfoAdmin } from "../types/auth";
import { getUser } from "../api/admin";

export function useUserDetails(userId: number | null) {
  return useQuery<{ data: UserInfoAdmin }, unknown>({
    queryKey: ["adminUser", userId],
    queryFn: async () => {
      if (userId == null) throw new Error("No userId");
      const res = await getUser(userId);
      return res as { data: UserInfoAdmin };
    },
    enabled: userId != null,
    staleTime: 1000 * 60 * 5,
  });
}
