package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponseDTO {
    private long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String videoUrl;
    private String status;
    private long viewCount;
    private String categoryName;
    private Long categoryId;
}
