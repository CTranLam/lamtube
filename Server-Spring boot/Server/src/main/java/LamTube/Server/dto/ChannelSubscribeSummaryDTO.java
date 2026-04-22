package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelSubscribeSummaryDTO {
    private boolean isSubscribed;
    private long subscriberCount;
}
