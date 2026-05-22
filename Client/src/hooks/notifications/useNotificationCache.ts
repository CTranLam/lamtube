import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/api/notifications";
import {
  EMPTY_NOTIFICATIONS,
  INITIAL_NOTIFICATION_LIMIT,
  NOTIFICATION_QUERY_KEY,
} from "@/constants/notification.constant";
import type { RealtimeNotification } from "@/types/notification";
import { getNotificationId } from "@/utils/notificationDisplay";
import { mergeNotificationItems } from "@/utils/notificationList";
import type { UseNotificationCacheOptions } from "@/types/notification/notificationUi";

export function useNotificationCache({
  isAuthenticated,
}: UseNotificationCacheOptions) {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: () => getNotifications(INITIAL_NOTIFICATION_LIMIT),
    enabled: false,
    initialData: [] as RealtimeNotification[],
  });

  const setNotificationItems = useCallback(
    (items: RealtimeNotification[]) => {
      queryClient.setQueryData<RealtimeNotification[]>(
        NOTIFICATION_QUERY_KEY,
        items,
      );
    },
    [queryClient],
  );

  const mergeNotifications = useCallback(
    (items: RealtimeNotification[]) => {
      queryClient.setQueryData<RealtimeNotification[]>(
        NOTIFICATION_QUERY_KEY,
        (current) => mergeNotificationItems(current, items),
      );
    },
    [queryClient],
  );

  const markLocalNotificationRead = useCallback(
    (item: RealtimeNotification) => {
      const readAt = new Date().toISOString();

      queryClient.setQueryData<RealtimeNotification[]>(
        NOTIFICATION_QUERY_KEY,
        (current = []) =>
          current.map((currentItem) =>
            getNotificationId(currentItem) === getNotificationId(item)
              ? {
                  ...currentItem,
                  isRead: true,
                  readAt,
                }
              : currentItem,
          ),
      );
    },
    [queryClient],
  );

  const markAllLocalNotificationsRead = useCallback(() => {
    const readAt = new Date().toISOString();

    queryClient.setQueryData<RealtimeNotification[]>(
      NOTIFICATION_QUERY_KEY,
      (current = []) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? readAt,
        })),
    );
  }, [queryClient]);

  const notificationItems = useMemo(() => {
    if (!isAuthenticated) {
      return EMPTY_NOTIFICATIONS;
    }
    return notificationsQuery.data;
  }, [isAuthenticated, notificationsQuery.data]);

  const unreadTotal = useMemo(
    () => notificationItems.filter((item) => !item.isRead).length,
    [notificationItems],
  );

  return {
    notificationItems,
    unreadTotal,
    setNotificationItems,
    mergeNotifications,
    markLocalNotificationRead,
    markAllLocalNotificationsRead,
  };
}
