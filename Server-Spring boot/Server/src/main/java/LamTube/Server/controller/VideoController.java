package LamTube.Server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.dto.comment.CommentCreateRequestDTO;
import LamTube.Server.dto.comment.CommentResponseDTO;
import LamTube.Server.dto.comment.CommentUpdateRequestDTO;
import LamTube.Server.dto.video.VideoReactionRequestDTO;
import LamTube.Server.dto.video.VideoReactionSummaryDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
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


    @GetMapping("/{videoId}/reaction-summary")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> getReactionSummary(
            @PathVariable Long videoId,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoReactionSummaryDTO summary = videoService.getReactionSummary(videoId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy thống kê tương tác thành công", summary));
    }

    @PostMapping("/{videoId}/reaction")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> reactToVideo(
            @PathVariable Long videoId,
            @RequestBody VideoReactionRequestDTO request,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoReactionSummaryDTO summary = videoService.reactToVideo(videoId, requesterEmail, request.getType());
        return ResponseEntity.ok(new ResponseDTO<>("Tương tác video thành công", summary));
    }

    @PutMapping("/{videoId}/reaction")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> updateReaction(
            @PathVariable Long videoId,
            @RequestBody VideoReactionRequestDTO request,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoReactionSummaryDTO summary = videoService.reactToVideo(videoId, requesterEmail, request.getType());
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật tương tác video thành công", summary));
    }

    @DeleteMapping("/{videoId}/reaction")
    public ResponseEntity<ResponseDTO<VideoReactionSummaryDTO>> removeReaction(
            @PathVariable Long videoId,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        VideoReactionSummaryDTO summary = videoService.removeReaction(videoId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Đã bỏ tương tác video", summary));
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

    private String extractRequesterEmail(Authentication authentication) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication.getName();
        }

        return null;
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<ResponseDTO<?>> updateView (@PathVariable Long videoId){
        if(videoId == null || videoId <= 0){
            return ResponseEntity.badRequest().body(new ResponseDTO<>("ID video không hợp lệ", null));
        }
        videoService.updateView(videoId);
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật lượt xem thành công", null));
    }

    @GetMapping("/{videoId}/comments")
    public ResponseEntity<ResponseDTO<PagedResponseDTO<CommentResponseDTO>>> getVideoComments(
            @PathVariable Long videoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponseDTO<CommentResponseDTO> comments = videoService.getVideoComments(videoId, page, size);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách bình luận thành công", comments));
    }

    @PostMapping("/{videoId}/comments")
    public ResponseEntity<ResponseDTO<CommentResponseDTO>> createVideoComment(
            @PathVariable Long videoId,
            @RequestBody CommentCreateRequestDTO request,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        CommentResponseDTO created = videoService.createVideoComment(videoId, requesterEmail, request);
        return ResponseEntity.ok(new ResponseDTO<>("Gửi bình luận thành công", created));
    }

    @PutMapping("/{videoId}/comments/{commentId}")
    public ResponseEntity<ResponseDTO<CommentResponseDTO>> updateVideoComment(
            @PathVariable Long videoId,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequestDTO request,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        CommentResponseDTO updated = videoService.updateVideoComment(videoId, commentId, requesterEmail, request);
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật bình luận thành công", updated));
    }

    @DeleteMapping("/{videoId}/comments/{commentId}")
    public ResponseEntity<ResponseDTO<Object>> deleteVideoComment(
            @PathVariable Long videoId,
            @PathVariable Long commentId,
            Authentication authentication) {
        String requesterEmail = extractRequesterEmail(authentication);
        videoService.deleteVideoComment(videoId, commentId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Xóa bình luận thành công", null));
    }

    @GetMapping("/{videoId}/related")
    public ResponseEntity<ResponseDTO<List<VideoResponseDTO>>> getRelatedVideos(
            @PathVariable Long videoId,
            @RequestParam(defaultValue = "10") int limit) {
        List<VideoResponseDTO> relatedVideos = videoService.getRelatedVideos(videoId, limit);
        return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách video thành công", relatedVideos));
    }   
}
