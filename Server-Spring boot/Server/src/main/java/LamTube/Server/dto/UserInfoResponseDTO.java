package LamTube.Server.dto;

import lombok.Data;

@Data
public class UserInfoResponseDTO {
    private Long id;
    private String email;
    private String fullname;
    private String bio;
    private String avatarUrl;
}
