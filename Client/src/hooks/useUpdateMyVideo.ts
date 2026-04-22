import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyVideo } from "../api/channel";
import type { MyVideoUpdatePayload } from "../types/channel";

export function useUpdateMyVideo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ videoId, payload }: { videoId: number; payload: MyVideoUpdatePayload }) =>
      updateMyVideo(videoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["channel", "myVideos"] });
    },
  });

  return {
    update: (videoId: number, payload: MyVideoUpdatePayload) =>
      mutation.mutateAsync({ videoId, payload }),
    pendingVideoId: mutation.isPending ? (mutation.variables?.videoId ?? null) : null,
    isLoading: mutation.isPending,
    error: mutation.error,
  } as const;
}
