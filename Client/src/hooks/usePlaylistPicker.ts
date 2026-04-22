import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVideoToPlaylist,
  createPlaylist,
  getMyPlaylistsForVideo,
  removeVideoFromPlaylist,
} from "../api/playlists";

type TogglePlaylistVideoPayload = {
  playlistId: number;
  containsVideo: boolean;
};

type CreatePlaylistWithVideoPayload = {
  name: string;
  isPrivate: boolean;
};

export function usePlaylistPicker(videoId: number, enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = ["playlists", "picker", videoId];

  const playlistsQuery = useQuery({
    queryKey,
    queryFn: () => getMyPlaylistsForVideo(videoId),
    enabled: enabled && !!videoId,
  });

  const toggleMutation = useMutation({
    mutationFn: async (payload: TogglePlaylistVideoPayload) => {
      if (payload.containsVideo) {
        await removeVideoFromPlaylist(payload.playlistId, videoId);
        return;
      }
      await addVideoToPlaylist(payload.playlistId, videoId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "list"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "detail"] });
    },
  });

  const createAndAddMutation = useMutation({
    mutationFn: async (payload: CreatePlaylistWithVideoPayload) => {
      const playlistId = await createPlaylist({
        name: payload.name,
        isPrivate: payload.isPrivate,
      });
      await addVideoToPlaylist(playlistId, videoId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "list"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists", "detail"] });
    },
  });

  return {
    ...playlistsQuery,
    togglePlaylistVideo: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    toggleError: toggleMutation.error,
    createPlaylistWithVideo: createAndAddMutation.mutateAsync,
    isCreatingPlaylist: createAndAddMutation.isPending,
    createPlaylistError: createAndAddMutation.error,
  };
}
