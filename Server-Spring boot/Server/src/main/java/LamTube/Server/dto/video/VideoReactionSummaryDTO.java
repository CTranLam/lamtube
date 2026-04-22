package LamTube.Server.dto.video;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoReactionSummaryDTO {
    private long likeCount;
    private long dislikeCount;
    private String myReaction;
}
