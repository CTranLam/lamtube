package LamTube.Server.dto;

import lombok.Data;

@Data
public class LikedVideoDTO {
    private Long id;
    private String title;
    private String thumbnailUrl;
    private String uploaderName;
    private Long viewCount;
}
