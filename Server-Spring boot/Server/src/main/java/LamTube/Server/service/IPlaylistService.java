package LamTube.Server.service;

import LamTube.Server.dto.PlaylistCreateRequestDTO;
import LamTube.Server.dto.PlaylistCreateResponseDTO;
import LamTube.Server.dto.PlaylistListItemDTO;
import LamTube.Server.dto.PlaylistPickerItemDTO;
import LamTube.Server.dto.PlaylistUpdateRequestDTO;
import LamTube.Server.dto.PlaylistVideoItemDTO;
import LamTube.Server.dto.WatchLaterVideoDTO;
import java.util.List;

public interface IPlaylistService {
    PlaylistCreateResponseDTO createPlaylist(String email, PlaylistCreateRequestDTO request);
    List<PlaylistListItemDTO> getMyPlaylists(String email);
    List<PlaylistVideoItemDTO> getPlaylistVideos(String email, Long playlistId);
    void updatePlaylist(String email, Long playlistId, PlaylistUpdateRequestDTO request);
    void deletePlaylist(String email, Long playlistId);
    void addVideoToPlaylist(String email, Long playlistId, Long videoId);
    void removeVideoFromPlaylist(String email, Long playlistId, Long videoId);
    List<PlaylistPickerItemDTO> getMyPlaylistsForVideo(String email, Long videoId);
    List<WatchLaterVideoDTO> getWatchLaterVideos(String email);
}
