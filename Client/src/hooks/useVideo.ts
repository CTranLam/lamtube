import { useQuery } from "@tanstack/react-query";
import { getVideoById } from "../api/videos";
import type { VideoDetail } from "../types/video";

export function useVideo(id: string | undefined) {
  return useQuery<VideoDetail | undefined>({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id),
    enabled: !!id,
  });
}
