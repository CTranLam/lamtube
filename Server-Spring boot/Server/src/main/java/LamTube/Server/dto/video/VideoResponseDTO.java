package LamTube.Server.dto.video;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponseDTO {
    private long id;
    private Long channelId;
    private Long uploaderId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String videoUrl;
    private String status;
    private long viewCount;
    private String categoryName;
    private Long categoryId;
    private String uploaderName;
    private String uploaderAvatarUrl;
    private Boolean isSubscribed;
    private Long subscriberCount;
    private Long likeCount;
    private Long dislikeCount;
    private Long commentCount;
}
