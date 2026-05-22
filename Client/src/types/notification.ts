export interface RealtimeNotification {
  _id?: string;
  eventId?: string;
  eventType?: string;
  actorId?: number | null;
  actorEmail?: string | null;
  targetUserId?: number | null;
  targetUserEmail?: string | null;
  videoId?: number | null;
  channelId?: number | null;
  reactionType?: string | null;
  commentId?: number | null;
  commentContent?: string | null;
  occurredAt?: string;
  createdAt?: string;
  isRead?: boolean;
  readAt?: string | null;
}
