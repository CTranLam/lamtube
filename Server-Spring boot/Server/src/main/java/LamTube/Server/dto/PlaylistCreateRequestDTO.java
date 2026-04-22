package LamTube.Server.dto;

import lombok.Data;

@Data
public class PlaylistCreateRequestDTO {
    private String name;
    private Boolean isPrivate;
}
