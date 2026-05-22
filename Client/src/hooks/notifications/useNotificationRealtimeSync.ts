import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import type { RealtimeNotification } from "@/types/notification";
import { normalizeNotifications } from "@/utils/notificationList";
import type { UseNotificationRealtimeSyncOptions } from "@/types/notification/notificationUi";

export function useNotificationRealtimeSync({
  mergeNotifications,
  onRealtimeNotification,
}: UseNotificationRealtimeSyncOptions) {
  const handleRealtimeNotification = useCallback(
    (item: RealtimeNotification) => {
      mergeNotifications([{ ...item, isRead: false }]);
      onRealtimeNotification?.(item);
    },
    [mergeNotifications, onRealtimeNotification],
  );

  const { notifications, clearNotifications } = useRealtimeNotifications({
    onNewNotification: handleRealtimeNotification,
  });

  const normalizedRealtimeNotifications = useMemo(
    () => normalizeNotifications(notifications),
    [notifications],
  );
  const normalizedRealtimeNotificationsRef = useRef<RealtimeNotification[]>([]);

  useEffect(() => {
    normalizedRealtimeNotificationsRef.current =
      normalizedRealtimeNotifications;
  }, [normalizedRealtimeNotifications]);

  return {
    normalizedRealtimeNotificationsRef,
    clearRealtimeNotifications: clearNotifications,
  };
}
