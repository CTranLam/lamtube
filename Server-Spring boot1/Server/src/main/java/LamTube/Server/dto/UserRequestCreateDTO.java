package LamTube.Server.dto;

import lombok.Data;

@Data
public class UserRequestCreateDTO {
    String email;
    String password;
    String fullname;
    String role;
}
