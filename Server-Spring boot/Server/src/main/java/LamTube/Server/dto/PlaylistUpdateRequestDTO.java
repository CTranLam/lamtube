package LamTube.Server.dto;

import lombok.Data;

@Data
public class PlaylistUpdateRequestDTO {
    private String name;
    private Boolean isPrivate;
}
