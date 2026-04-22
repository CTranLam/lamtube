import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWatchLaterVideos, removeVideoFromWatchLater } from "../api/playlists";

export function useWatchLaterVideos(enabled = true) {
  const queryClient = useQueryClient();
  const watchLaterQuery = useQuery({
    queryKey: ["watch-later-videos"],
    queryFn: getWatchLaterVideos,
    enabled,
  });

  const removeMutation = useMutation({
    mutationFn: (videoId: number) => removeVideoFromWatchLater(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "list"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "detail"] });
    },
  });

  return {
    ...watchLaterQuery,
    removeFromWatchLater: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removingVideoId: removeMutation.variables ?? null,
    removeError: removeMutation.error,
  };
}
