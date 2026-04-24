package LamTube.Server.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    @NotBlank(message = "resetToken không được để trống")
    private String resetToken;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    private String newPassword;

    @NotBlank(message = "Mật khẩu nhập lại không được để trống")
    private String retypedPassword;
}
