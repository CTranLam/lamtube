package LamTube.Server.service;

import LamTube.Server.dto.ChannelSubscriptionSummaryDTO;

public interface ISubscriptionService {
    ChannelSubscriptionSummaryDTO subscribeChannel(Long channelId, String requesterEmail);

    ChannelSubscriptionSummaryDTO unsubscribeChannel(Long channelId, String requesterEmail);
}
