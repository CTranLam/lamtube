import { useQuery } from "@tanstack/react-query";
import { getTrendingVideos } from "../api/videos";
import type { Video } from "../types/video";

export function useVideos(categoryId?: number) {
  return useQuery<Video[]>({
    queryKey: ["videos", "trending", categoryId ?? "all"],
    queryFn: () => getTrendingVideos(categoryId),
  });
}
