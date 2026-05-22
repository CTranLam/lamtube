import type { RealtimeNotification } from "@/types/notification";
import type { NotificationDisplayData } from "@/types/notification/notificationDisplayData";
import { NotificationEventType } from "@/types/notification/notificationUi";
import type { NotificationTemplateMap } from "@/types/notification/notificationUi";

export function getNotificationId(item: RealtimeNotification): string {
  return (
    item.eventId ??
    item._id ??
    `${item.createdAt ?? ""}-${item.actorId ?? ""}-${item.eventType ?? ""}`
  );
}

export function getActorName(item: RealtimeNotification): string {
  return item.actorEmail?.trim() || "Một người dùng";
}

export function getTimeLabel(item: RealtimeNotification): string {
  const value = item.createdAt || item.occurredAt;
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export function getNotificationText(
  item: RealtimeNotification,
): NotificationDisplayData {
  const actor = getActorName(item);
  const event = item.eventType;

  const notificationDetailByEvent: NotificationTemplateMap = {
    [NotificationEventType.Comment]: {
      title: `${actor} đã bình luận video của bạn`,
      detail: item.commentContent?.trim()
        ? `"${item.commentContent.trim()}"`
        : `Video #${item.videoId ?? "?"}`,
    },
    [NotificationEventType.Subscribe]: {
      title: `${actor} đã đăng ký kênh của bạn`,
      detail: `Kênh #${item.channelId ?? "?"}`,
    },
    [NotificationEventType.Like]: {
      title: `${actor} đã thích video của bạn`,
      detail: `Video #${item.videoId ?? "?"}`,
    },
    [NotificationEventType.Dislike]: {
      title: `${actor} đã bỏ thích video của bạn`,
      detail: `Video #${item.videoId ?? "?"}`,
    },
  };

  if (isNotificationEventType(event)) {
    return notificationDetailByEvent[event];
  }

  return {
    title: `${actor} vừa gửi một tương tác mới`,
    detail: event || "notification:new",
  };
}

function isNotificationEventType(
  event: string | undefined,
): event is NotificationEventType {
  return Object.values(NotificationEventType).includes(
    event as NotificationEventType,
  );
}

export function getNotificationSummary(item: RealtimeNotification): string {
  return getNotificationText(item).detail;
}
