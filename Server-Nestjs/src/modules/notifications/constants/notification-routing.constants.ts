export const NOTIFICATION_ROUTING_KEYS = [
  'notification.video.like',
  'notification.video.dislike',
  'notification.video.comment',
  'notification.channel.subscribe',
] as const;

export type NotificationRoutingKey = (typeof NOTIFICATION_ROUTING_KEYS)[number];
