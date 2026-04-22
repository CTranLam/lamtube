package LamTube.Server.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthLoginResultDTO {
    private String accessToken;
    private String refreshToken;
}
