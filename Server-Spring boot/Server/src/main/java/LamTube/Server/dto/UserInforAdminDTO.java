package LamTube.Server.dto;

import lombok.Data;

@Data
public class UserInforAdminDTO {
    private Long id;
    private String email;
    private String fullname;
    private String bio;
    private String avatarUrl;
    private String role;
}
