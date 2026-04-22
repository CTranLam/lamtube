package LamTube.Server.dto.channel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelStatsDTO {
    private long totalSubscribers;
    private long totalViews;
    private long totalLikes;
    private long totalDislikes;
    private long totalVideos;
    private long monthlyViews;
    private long monthlyLikes;
    private long monthlyDislikes;
}
