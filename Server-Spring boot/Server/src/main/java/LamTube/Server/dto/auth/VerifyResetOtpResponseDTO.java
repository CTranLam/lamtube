package LamTube.Server.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResetOtpResponseDTO {
    private String resetToken;
}
