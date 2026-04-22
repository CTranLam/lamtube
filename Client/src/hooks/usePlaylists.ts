import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlaylist,
  deletePlaylist,
  getMyPlaylists,
  getPlaylistVideos,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../api/playlists";
import type { CreatePlaylistPayload, PlaylistUpdatePayload } from "../types/playlist";

export const PLAYLISTS_LIST_QUERY_KEY = ["playlists", "list"] as const;

export function playlistDetailQueryKey(playlistId: number) {
  return ["playlists", "detail", playlistId] as const;
}

export function useMyPlaylists(enabled = true) {
  return useQuery({
    queryKey: PLAYLISTS_LIST_QUERY_KEY,
    queryFn: getMyPlaylists,
    enabled,
  });
}

export function usePlaylistVideos(playlistId: number, enabled = true) {
  return useQuery({
    queryKey: playlistDetailQueryKey(playlistId),
    queryFn: () => getPlaylistVideos(playlistId),
    enabled: enabled && !!playlistId,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlaylistPayload) => createPlaylist(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PLAYLISTS_LIST_QUERY_KEY });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, payload }: { playlistId: number; payload: PlaylistUpdatePayload }) =>
      updatePlaylist(playlistId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: PLAYLISTS_LIST_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(variables.playlistId) });
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: number) => deletePlaylist(playlistId),
    onSuccess: async (_, playlistId) => {
      await queryClient.invalidateQueries({ queryKey: PLAYLISTS_LIST_QUERY_KEY });
      await queryClient.removeQueries({ queryKey: playlistDetailQueryKey(playlistId) });
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
    },
  });
}

export function useRemoveVideoFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: number; videoId: number }) =>
      removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: playlistDetailQueryKey(variables.playlistId) });
      await queryClient.invalidateQueries({ queryKey: PLAYLISTS_LIST_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["watch-later-videos"] });
    },
  });
}
