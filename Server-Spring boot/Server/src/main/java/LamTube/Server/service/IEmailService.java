package LamTube.Server.service;

public interface IEmailService {
    void sendPasswordResetOtp(String toEmail, String otp, long expiryMinutes);
}
