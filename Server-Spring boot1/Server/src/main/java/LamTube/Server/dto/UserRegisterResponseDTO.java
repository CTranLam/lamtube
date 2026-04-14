package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRegisterResponseDTO {
    private Long id;
    private String email;
}
