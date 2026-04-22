package LamTube.Server.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class WatchHistoryItemDTO {
    private Long videoId;
    private String title;
    private String thumbnailUrl;
    private String uploaderName;
    private Long viewCount;
    private LocalDateTime watchedAt;
}
