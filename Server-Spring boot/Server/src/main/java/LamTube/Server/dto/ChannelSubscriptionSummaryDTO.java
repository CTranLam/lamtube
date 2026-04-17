package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelSubscriptionSummaryDTO {
    private boolean isSubscribed;
    private long subscriberCount;
}