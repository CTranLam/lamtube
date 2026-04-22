package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlaylistListItemDTO {
    private Long id;
    private String name;
    private Boolean isPrivate;
    private Long videoCount;
}
