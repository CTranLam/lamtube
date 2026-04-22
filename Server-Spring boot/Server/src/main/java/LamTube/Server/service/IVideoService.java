package LamTube.Server.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.dto.comment.CommentCreateRequestDTO;
import LamTube.Server.dto.comment.CommentResponseDTO;
import LamTube.Server.dto.comment.CommentUpdateRequestDTO;
import LamTube.Server.dto.video.VideoReactionSummaryDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;

public interface IVideoService {
    VideoResponseDTO getVideoById(Long videoId, String requesterEmail);

    PagedResponseDTO<VideoResponseDTO> getHomeVideos(int page, int size, Long categoryId, String title);
    VideoReactionSummaryDTO getReactionSummary(Long videoId, String requesterEmail);
    VideoReactionSummaryDTO reactToVideo(Long videoId, String requesterEmail, String type);
    VideoReactionSummaryDTO removeReaction(Long videoId, String requesterEmail);

    ResponseEntity<StreamingResponseBody> streamVideo(Long videoId, String requesterEmail, String rangeHeader,
            String ifRangeHeader);

    void updateView(Long videoId);

    PagedResponseDTO<CommentResponseDTO> getVideoComments(Long videoId, int page, int size);
    CommentResponseDTO createVideoComment(Long videoId, String requesterEmail, CommentCreateRequestDTO request);
    CommentResponseDTO updateVideoComment(Long videoId, Long commentId, String requesterEmail, CommentUpdateRequestDTO request);
    void deleteVideoComment(Long videoId, Long commentId, String requesterEmail);
    List<VideoResponseDTO> getRelatedVideos(Long videoId, int limit);
}
