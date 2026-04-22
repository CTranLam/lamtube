import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMyVideo } from "../api/channel";

export function useDeleteMyVideo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (videoId: number) => deleteMyVideo(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["channel", "myVideos"] });
    },
  });

  return {
    remove: (videoId: number) => mutation.mutateAsync(videoId),
    pendingVideoId: mutation.isPending ? (mutation.variables ?? null) : null,
    isLoading: mutation.isPending,
    error: mutation.error,
  } as const;
}
