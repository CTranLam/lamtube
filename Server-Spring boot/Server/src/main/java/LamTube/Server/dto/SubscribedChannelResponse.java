package LamTube.Server.dto;

import lombok.Data;

@Data
public class SubscribedChannelResponse {
    private Long channelId;      
    private String channelName; 
    private String channelHandle;
    private String avatarUrl;
    private String description;
    private Long subscriberCount;
    private Boolean isSubscribed; 
}
