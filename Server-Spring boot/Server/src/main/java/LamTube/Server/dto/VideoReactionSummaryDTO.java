package LamTube.Server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VideoReactionSummaryDTO {
    private Long videoId;
    private long likeCount;
    private long dislikeCount;
    private String myReaction;
}