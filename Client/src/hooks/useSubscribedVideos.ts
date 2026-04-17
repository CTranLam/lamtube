import { useInfiniteQuery } from "@tanstack/react-query";
import { getSubscribedVideos } from "../api/subscriptions";

type UseSubscribedVideosParams = {
  size?: number;
  enabled?: boolean;
};

export function useSubscribedVideos({
  size = 12,
  enabled = true,
}: UseSubscribedVideosParams = {}) {
  return useInfiniteQuery({
    queryKey: ["subscriptions", "videos", size],
    initialPageParam: 0,
    enabled,
    queryFn: ({ pageParam }) =>
      getSubscribedVideos({
        page: Number(pageParam) || 0,
        size,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
}
