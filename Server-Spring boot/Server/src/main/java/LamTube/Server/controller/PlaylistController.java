package LamTube.Server.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import LamTube.Server.dto.PlaylistCreateRequestDTO;
import LamTube.Server.dto.PlaylistCreateResponseDTO;
import LamTube.Server.dto.PlaylistListItemDTO;
import LamTube.Server.dto.PlaylistPickerItemDTO;
import LamTube.Server.dto.PlaylistUpdateRequestDTO;
import LamTube.Server.dto.PlaylistVideoItemDTO;
import LamTube.Server.dto.WatchLaterVideoDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.service.IPlaylistService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final IPlaylistService playlistService;

    @PostMapping
    public ResponseEntity<ResponseDTO<PlaylistCreateResponseDTO>> createPlaylist(
            @RequestBody PlaylistCreateRequestDTO request,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            PlaylistCreateResponseDTO created = playlistService.createPlaylist(email, request);
            return ResponseEntity.ok(new ResponseDTO<>("Tạo danh sách phát thành công", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO<List<PlaylistListItemDTO>>> getMyPlaylists(Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            List<PlaylistListItemDTO> playlists = playlistService.getMyPlaylists(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách playlist thành công", playlists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseDTO<List<PlaylistPickerItemDTO>>> getMyPlaylistsForVideo(
            @RequestParam Long videoId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            List<PlaylistPickerItemDTO> playlists = playlistService.getMyPlaylistsForVideo(email, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách phát thành công", playlists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/{playlistId}/videos")
    public ResponseEntity<ResponseDTO<List<PlaylistVideoItemDTO>>> getPlaylistVideos(
            @PathVariable Long playlistId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            List<PlaylistVideoItemDTO> videos = playlistService.getPlaylistVideos(email, playlistId);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy video của playlist thành công", videos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PutMapping("/{playlistId}")
    public ResponseEntity<ResponseDTO<?>> updatePlaylist(
            @PathVariable Long playlistId,
            @RequestBody PlaylistUpdateRequestDTO request,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            playlistService.updatePlaylist(email, playlistId, request);
            return ResponseEntity.ok(new ResponseDTO<>("Cập nhật playlist thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<ResponseDTO<?>> deletePlaylist(
            @PathVariable Long playlistId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            playlistService.deletePlaylist(email, playlistId);
            return ResponseEntity.ok(new ResponseDTO<>("Xóa playlist thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PutMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<ResponseDTO<?>> addVideoToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long videoId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            playlistService.addVideoToPlaylist(email, playlistId, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Thêm video vào danh sách phát thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    public ResponseEntity<ResponseDTO<?>> removeVideoFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long videoId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            playlistService.removeVideoFromPlaylist(email, playlistId, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Xóa video khỏi danh sách phát thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/watch-later/videos")
    public ResponseEntity<ResponseDTO<List<WatchLaterVideoDTO>>> getWatchLaterVideos(
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            List<WatchLaterVideoDTO> videos = playlistService.getWatchLaterVideos(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách phát Watch Later thành công", videos));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }
}
