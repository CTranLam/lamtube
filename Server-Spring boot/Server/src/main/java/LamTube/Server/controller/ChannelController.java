package LamTube.Server.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import LamTube.Server.dto.ChannelSubscriptionSummaryDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.service.ISubscriptionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ISubscriptionService subscriptionService;

    @PostMapping("/{channelId}/subscribe")
    public ResponseEntity<ResponseDTO<ChannelSubscriptionSummaryDTO>> subscribeChannel(
            @PathVariable Long channelId,
            Principal principal) {
        String requesterEmail = principal.getName();
        if (requesterEmail == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseDTO<>("Bạn cần đăng nhập để thực hiện thao tác này.", null));
        }

        ChannelSubscriptionSummaryDTO summary = subscriptionService.subscribeChannel(channelId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Đăng ký kênh thành công", summary));
    }

    @DeleteMapping("/{channelId}/subscribe")
    public ResponseEntity<ResponseDTO<ChannelSubscriptionSummaryDTO>> unsubscribeChannel(
            @PathVariable Long channelId,
            Principal principal) {
        String requesterEmail = principal.getName();
        if (requesterEmail == null) {
            return ResponseEntity.status(401)
                    .body(new ResponseDTO<>("Bạn cần đăng nhập để thực hiện thao tác này.", null));
        }

        ChannelSubscriptionSummaryDTO summary = subscriptionService.unsubscribeChannel(channelId, requesterEmail);
        return ResponseEntity.ok(new ResponseDTO<>("Hủy đăng ký kênh thành công", summary));
    }
}