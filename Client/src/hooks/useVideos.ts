import { useInfiniteQuery } from "@tanstack/react-query";
import { getHomeVideos } from "../api/videos";

type UseVideosParams = {
  categoryId?: number;
  title?: string;
  size?: number;
};

export function useVideos({ categoryId, title, size = 16 }: UseVideosParams) {
  return useInfiniteQuery({
    queryKey: ["videos", "home", categoryId ?? "all", title ?? "", size],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getHomeVideos({
        categoryId,
        title,
        size,
        page: Number(pageParam) || 0,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
}
