package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlaylistVideoItemDTO {
    private Long id;
    private String title;
    private String thumbnailUrl;
    private String uploaderName;
    private Long viewCount;
}
