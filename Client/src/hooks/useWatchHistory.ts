import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearWatchHistory,
  deleteWatchHistoryVideo,
  getWatchHistory,
} from "../api/watchHistory";

export function useWatchHistory(enabled = true) {
  return useQuery({
    queryKey: ["watch-history"],
    queryFn: getWatchHistory,
    enabled,
  });
}

export function useClearWatchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearWatchHistory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watch-history"] });
    },
  });
}

export function useDeleteWatchHistoryVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => deleteWatchHistoryVideo(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watch-history"] });
    },
  });
}
