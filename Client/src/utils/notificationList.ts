import { MAX_NOTIFICATION_ITEMS } from "@/constants/notification.constant";
import type { RealtimeNotification } from "@/types/notification";
import { getNotificationId } from "@/utils/notificationDisplay";

export function normalizeNotifications(items: RealtimeNotification[]) {
  return items.map((item) => ({
    ...item,
    isRead: item.isRead ?? false,
  }));
}

export function mergeNotificationItems(
  currentItems: RealtimeNotification[] | undefined,
  incomingItems: RealtimeNotification[],
) {
  if (incomingItems.length === 0) {
    return currentItems ?? [];
  }

  const next = [...(currentItems ?? [])];
  normalizeNotifications(incomingItems)
    .slice()
    .reverse()
    .forEach((item) => {
      const id = getNotificationId(item);
      const index = next.findIndex(
        (current) => getNotificationId(current) === id,
      );
      if (index === -1) {
        next.unshift(item);
      } else {
        next[index] = { ...next[index], ...item };
      }
    });

  return next.slice(0, MAX_NOTIFICATION_ITEMS);
}
