package LamTube.Server.service.impl;

import org.springframework.stereotype.Service;

import LamTube.Server.dto.PlaylistCreateRequestDTO;
import LamTube.Server.dto.PlaylistCreateResponseDTO;
import LamTube.Server.dto.PlaylistListItemDTO;
import LamTube.Server.dto.PlaylistPickerItemDTO;
import LamTube.Server.dto.PlaylistUpdateRequestDTO;
import LamTube.Server.dto.PlaylistVideoItemDTO;
import LamTube.Server.dto.WatchLaterVideoDTO;
import LamTube.Server.model.PlaylistEntity;
import LamTube.Server.model.PlaylistVideoEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.repository.PlaylistRepository;
import LamTube.Server.repository.PlaylistVideoRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.repository.VideoRepository;
import LamTube.Server.service.IPlaylistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PlaylistServiceImpl implements IPlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistVideoRepository playlistVideoRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    @Override
    public PlaylistCreateResponseDTO createPlaylist(String email, PlaylistCreateRequestDTO request) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để tạo danh sách phát.");
        }
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Tên danh sách phát không được để trống.");
        }

        String playlistName = request.getName().trim();
        if (playlistRepository.existsByUser_EmailAndNameIgnoreCaseAndIsDeletedFalse(email, playlistName)) {
            throw new RuntimeException("Danh sách phát đã tồn tại.");
        }

        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        PlaylistEntity playlist = new PlaylistEntity();
        playlist.setName(playlistName);
        playlist.setIsPrivate(request.getIsPrivate() == null ? true : request.getIsPrivate());
        playlist.setIsDeleted(false);
        playlist.setUser(user);

        PlaylistEntity saved = playlistRepository.save(playlist);
        return new PlaylistCreateResponseDTO(saved.getId());
    }

    @Override
    public List<PlaylistListItemDTO> getMyPlaylists(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xem danh sách phát.");
        }

        userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return playlistRepository.findListItemsByUserEmail(email);
    }

    @Override
    public List<PlaylistVideoItemDTO> getPlaylistVideos(String email, Long playlistId) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xem video trong danh sách phát.");
        }
        if (playlistId == null || playlistId <= 0) {
            throw new RuntimeException("Playlist không hợp lệ.");
        }

        playlistRepository.findByIdAndUser_EmailAndIsDeletedFalse(playlistId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh sách phát."));

        List<VideoEntity> videos = playlistVideoRepository.findVideosByPlaylistIdAndUserEmail(playlistId, email);
        return videos.stream()
                .map(this::toPlaylistVideoItemDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void updatePlaylist(String email, Long playlistId, PlaylistUpdateRequestDTO request) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để cập nhật danh sách phát.");
        }
        if (playlistId == null || playlistId <= 0) {
            throw new RuntimeException("Playlist không hợp lệ.");
        }
        if (request == null) {
            throw new RuntimeException("Dữ liệu cập nhật không hợp lệ.");
        }

        PlaylistEntity playlist = playlistRepository.findByIdAndUser_EmailAndIsDeletedFalse(playlistId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh sách phát."));

        if (request.getName() != null) {
            String nextName = request.getName().trim();
            if (nextName.isBlank()) {
                throw new RuntimeException("Tên danh sách phát không được để trống.");
            }
            if (playlistRepository.existsByUser_EmailAndNameIgnoreCaseAndIsDeletedFalseAndIdNot(
                    email,
                    nextName,
                    playlistId)) {
                throw new RuntimeException("Danh sách phát đã tồn tại.");
            }
            playlist.setName(nextName);
        }

        if (request.getIsPrivate() != null) {
            playlist.setIsPrivate(request.getIsPrivate());
        }

        playlistRepository.save(playlist);
    }

    @Override
    public void deletePlaylist(String email, Long playlistId) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xóa danh sách phát.");
        }
        if (playlistId == null || playlistId <= 0) {
            throw new RuntimeException("Playlist không hợp lệ.");
        }

        PlaylistEntity playlist = playlistRepository.findByIdAndUser_EmailAndIsDeletedFalse(playlistId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh sách phát."));
        playlist.setIsDeleted(true);
        playlistRepository.save(playlist);
    }

    @Override
    public void addVideoToPlaylist(String email, Long playlistId, Long videoId) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để thêm video vào danh sách phát.");
        }
        if (playlistId == null || playlistId <= 0) {
            throw new RuntimeException("Playlist không hợp lệ.");
        }
        if (videoId == null || videoId <= 0) {
            throw new RuntimeException("Video không hợp lệ.");
        }

        PlaylistEntity playlist = playlistRepository.findByIdAndUser_EmailAndIsDeletedFalse(playlistId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh sách phát."));

        var video = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (video == null) {
            throw new RuntimeException("Không tìm thấy video.");
        }

        if (playlistVideoRepository.existsByPlaylist_IdAndVideo_Id(playlistId, videoId)) {
            return;
        }

        PlaylistVideoEntity playlistVideo = new PlaylistVideoEntity();
        playlistVideo.setPlaylist(playlist);
        playlistVideo.setVideo(video);
        playlistVideoRepository.save(playlistVideo);
    }

    @Override
    public void removeVideoFromPlaylist(String email, Long playlistId, Long videoId) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xóa video khỏi danh sách phát.");
        }
        if (playlistId == null || playlistId <= 0) {
            throw new RuntimeException("Playlist không hợp lệ.");
        }
        if (videoId == null || videoId <= 0) {
            throw new RuntimeException("Video không hợp lệ.");
        }

        playlistRepository.findByIdAndUser_EmailAndIsDeletedFalse(playlistId, email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh sách phát."));

        playlistVideoRepository.deleteByPlaylist_IdAndVideo_Id(playlistId, videoId);
    }

    @Override
    public List<PlaylistPickerItemDTO> getMyPlaylistsForVideo(String email, Long videoId) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xem danh sách phát.");
        }
        if (videoId == null || videoId <= 0) {
            throw new RuntimeException("Video không hợp lệ.");
        }

        userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return playlistRepository.findPickerItemsByUserEmailAndVideoId(email, videoId);
    }

    @Override
    public List<WatchLaterVideoDTO> getWatchLaterVideos(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Bạn cần đăng nhập để xem danh sách Xem sau.");
        }

        userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<VideoEntity> videos = playlistVideoRepository.findWatchLaterVideosByUserEmailAndPlaylistNames(
                email,
                List.of("xem sau", "watch later"));

        return videos.stream()
                .map(this::toWatchLaterVideoDTO)
                .collect(Collectors.toList());
    }

    private WatchLaterVideoDTO toWatchLaterVideoDTO(VideoEntity video) {
        WatchLaterVideoDTO dto = new WatchLaterVideoDTO();
        dto.setId(video.getId());
        dto.setTitle(video.getTitle());
        dto.setThumbnailUrl(video.getThumbnailUrl());
        dto.setUploaderName(buildChannelName(video.getUser()));
        dto.setViewCount(video.getViewCount() != null ? video.getViewCount() : 0L);
        return dto;
    }

    private PlaylistVideoItemDTO toPlaylistVideoItemDTO(VideoEntity video) {
        return new PlaylistVideoItemDTO(
                video.getId(),
                video.getTitle(),
                video.getThumbnailUrl(),
                buildChannelName(video.getUser()),
                video.getViewCount() != null ? video.getViewCount() : 0L);
    }

    private String buildChannelName(UserEntity user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return "LamTube";
        }
        return user.getEmail().split("@")[0];
    }

}
