export interface NotificationEventPayload {
  eventId?: string;
  eventType?: string;
  occurredAt?: string;

  actorId?: number;
  actorEmail?: string;

  targetUserId?: number;
  targetUserEmail?: string;

  videoId?: number;
  reactionType?: string;

  commentId?: number;
  parentCommentId?: number;
  commentContent?: string;

  channelId?: number;
}
