package LamTube.Server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.dto.VideoReactionRequestDTO;
import LamTube.Server.dto.VideoReactionSummaryDTO;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.service.IVideoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final IVideoService videoService;

    @GetMapping
    public ResponseEntity<ResponseDTO<PagedResponseDTO<VideoResponseDTO>>> getHomeVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String title
        ) {
        PagedResponseDTO<VideoResponseDTO> videos = videoService.getHomeVideos(page, size, categoryId, title);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách video thành công", videos));
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<ResponseDTO<VideoResponseDTO>> getVideoById(@PathVariable Long videoId,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoResponseDTO video = videoService.getVideoById(videoId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy thông tin video thành công", video));
    }

    @GetMapping("/{videoId}/stream")
    public ResponseEntity<StreamingResponseBody> streamVideo(
            @PathVariable Long videoId,
            @RequestHeader(value = "Range", required = false) String range,
            @RequestHeader(value = "If-Range", required = false) String ifRange,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        return videoService.streamVideo(videoId, requesterEmail, range, ifRange);
    }

    @GetMapping("/{videoId}/reaction-summary")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> getVideoReactionSummary(
            @PathVariable Long videoId,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoReactionSummaryDTO summary = videoService.getVideoReactionSummary(videoId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy thống kê reaction thành công", summary));
    }

    @PutMapping("/{videoId}/reaction")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> setVideoReaction(
            @PathVariable Long videoId,
            @RequestBody(required = false) VideoReactionRequestDTO request,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        if (requesterEmail == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseDTO<>("Bạn cần đăng nhập để thực hiện thao tác này.", null));
        }

        String reactionType = request == null ? null : request.getType();
        VideoReactionSummaryDTO summary = videoService.setVideoReaction(videoId, requesterEmail, reactionType);
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật reaction thành công", summary));
    }

    private String extractRequesterEmail(Authentication authentication) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication.getName();
        }

        return null;
    }
}