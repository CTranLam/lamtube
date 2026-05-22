import { useNotificationCache } from "@/hooks/notifications/useNotificationCache";
import { useNotificationFetch } from "@/hooks/notifications/useNotificationFetch";
import { useNotificationReadActions } from "@/hooks/notifications/useNotificationReadActions";
import { useNotificationRealtimeSync } from "@/hooks/notifications/useNotificationRealtimeSync";
import type { UseNotificationsOptions } from "@/types/notification/notificationUi";

export function useNotifications({
  isAuthenticated,
  onRealtimeNotification,
}: UseNotificationsOptions) {
  const {
    notificationItems,
    unreadTotal,
    setNotificationItems,
    mergeNotifications,
    markLocalNotificationRead,
    markAllLocalNotificationsRead,
  } = useNotificationCache({ isAuthenticated });

  const { normalizedRealtimeNotificationsRef, clearRealtimeNotifications } =
    useNotificationRealtimeSync({
      mergeNotifications,
      onRealtimeNotification,
    });

  const { fetchNotifications, notificationRequest } = useNotificationFetch({
    isAuthenticated,
    setNotificationItems,
    mergeNotifications,
    realtimeFallbackRef: normalizedRealtimeNotificationsRef,
  });

  const { markNotificationRead, markAllRead } = useNotificationReadActions({
    markLocalNotificationRead,
    markAllLocalNotificationsRead,
    clearRealtimeNotifications,
  });

  return {
    notificationItems,
    notificationRequest,
    unreadTotal,
    fetchNotifications,
    markNotificationRead,
    markAllRead,
  };
}
