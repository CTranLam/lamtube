package LamTube.Server.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import LamTube.Server.service.IEmailService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp, long expiryMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("LamTube - Ma OTP dat lai mat khau");
        message.setText("""
                Xin chao,

                Ma OTP dat lai mat khau cua ban la: %s
                Ma nay co hieu luc trong %d phut.

                Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.
                """.formatted(otp, expiryMinutes));

        mailSender.send(message);
    }
}
