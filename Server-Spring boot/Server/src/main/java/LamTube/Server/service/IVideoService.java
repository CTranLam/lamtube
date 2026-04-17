package LamTube.Server.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.dto.VideoReactionSummaryDTO;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;

public interface IVideoService {
    VideoResponseDTO getVideoById(Long videoId, String requesterEmail);

    PagedResponseDTO<VideoResponseDTO> getHomeVideos(int page, int size, Long categoryId, String title);

    ResponseEntity<StreamingResponseBody> streamVideo(Long videoId, String requesterEmail, String rangeHeader,
            String ifRangeHeader);

    VideoReactionSummaryDTO getVideoReactionSummary(Long videoId, String requesterEmail);

    VideoReactionSummaryDTO setVideoReaction(Long videoId, String requesterEmail, String reactionType);
}