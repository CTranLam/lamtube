package LamTube.Server.dto;

import lombok.Data;

@Data
public class UserRequestUpdateDTO {
    private String fullname;
    private String bio;
    private String avatarUrl;
}
