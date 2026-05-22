import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  markOneNotificationRead,
} from "@/api/notifications";
import type { RealtimeNotification } from "@/types/notification";
import type { UseNotificationReadActionsOptions } from "@/types/notification/notificationUi";

export function useNotificationReadActions({
  markLocalNotificationRead,
  markAllLocalNotificationsRead,
  clearRealtimeNotifications,
}: UseNotificationReadActionsOptions) {
  const { mutateAsync: markOneNotificationReadMutation } = useMutation({
    mutationFn: markOneNotificationRead,
  });

  const { mutateAsync: markAllNotificationsReadMutation } = useMutation({
    mutationFn: markAllNotificationsRead,
  });

  const markNotificationRead = useCallback(
    async (item: RealtimeNotification) => {
      if (!item.eventId || item.isRead) {
        return;
      }

      try {
        await markOneNotificationReadMutation(item.eventId);
      } catch {
        // Keep UX responsive even if read-state sync fails.
      }

      markLocalNotificationRead(item);
      clearRealtimeNotifications();
    },
    [
      clearRealtimeNotifications,
      markLocalNotificationRead,
      markOneNotificationReadMutation,
    ],
  );

  const markAllRead = useCallback(() => {
    void (async () => {
      try {
        await markAllNotificationsReadMutation();
      } catch {
        // Keep UX responsive even if read-state sync fails.
      }

      markAllLocalNotificationsRead();
      clearRealtimeNotifications();
    })();
  }, [
    clearRealtimeNotifications,
    markAllLocalNotificationsRead,
    markAllNotificationsReadMutation,
  ]);

  return {
    markNotificationRead,
    markAllRead,
  };
}
