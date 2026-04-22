import { useQuery } from "@tanstack/react-query";
import { getRelatedVideos } from "../api/videos";
import type { RelatedVideo } from "../types/video";

export function useRelatedVideos(videoId: number | undefined, limit = 20) {
  return useQuery<RelatedVideo[]>({
    queryKey: ["videos", "related", videoId ?? 0, limit],
    queryFn: () => getRelatedVideos(videoId as number, limit),
    enabled: Number.isFinite(videoId) && Number(videoId) > 0,
  });
}
