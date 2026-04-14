package LamTube.Server.dto;

import lombok.Data;

@Data
public class VideoRequestDTO {
    String title;
    String description;
    String categoryId;
    String status;
}