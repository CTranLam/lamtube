package LamTube.Server.dto;

import lombok.Data;

@Data
public class UserInfoAdminUpdateDTO {
    private String fullname;
    private String password;
    private String bio;
    private String avatarUrl;
    private String role;
}
