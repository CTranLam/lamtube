package LamTube.Server.dto.comment;

import lombok.Data;

@Data
public class CommentCreateRequestDTO {
    private String content;
    private Long parentId;
}
