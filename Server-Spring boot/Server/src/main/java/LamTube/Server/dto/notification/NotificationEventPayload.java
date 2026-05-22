package LamTube.Server.dto.notification;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEventPayload {
    private String eventId;
    private String eventType;
    private Instant occurredAt;

    private Long actorId;
    private String actorEmail;

    private Long targetUserId;
    private String targetUserEmail;

    private Long videoId;
    private String reactionType;

    private Long commentId;
    private Long parentCommentId;
    private String commentContent;

    private Long channelId;
}
