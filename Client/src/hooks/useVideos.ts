import { useQuery } from "@tanstack/react-query";
import { getTrendingVideos } from "../api/videos";
import type { Video } from "../types/video";

export function useVideos() {
  return useQuery<Video[]>({
    queryKey: ["videos", "trending"],
    queryFn: getTrendingVideos,
  });
}
