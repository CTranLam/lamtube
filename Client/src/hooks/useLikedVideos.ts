import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikedVideos, removeVideoReaction } from "../api/videos";

export function useLikedVideos(enabled = true) {
  const queryClient = useQueryClient();
  const likedVideosQuery = useQuery({
    queryKey: ["liked-videos"],
    queryFn: getLikedVideos,
    enabled,
  });

  const unlikeMutation = useMutation({
    mutationFn: (videoId: number) => removeVideoReaction(videoId),
    onSuccess: async (_, videoId) => {
      await queryClient.invalidateQueries({ queryKey: ["liked-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["video", String(videoId)] });
    },
  });

  return {
    ...likedVideosQuery,
    unlikeVideo: unlikeMutation.mutateAsync,
    isUnliking: unlikeMutation.isPending,
    unlikingVideoId: unlikeMutation.variables ?? null,
    unlikeError: unlikeMutation.error,
  };
}
