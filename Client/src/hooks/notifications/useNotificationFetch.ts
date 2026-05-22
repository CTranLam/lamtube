import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { getNotifications } from "@/api/notifications";
import { INITIAL_NOTIFICATION_LIMIT } from "@/constants/notification.constant";
import type { FetchNotificationsOptions } from "@/types/notification/notificationUi";
import type { UseNotificationFetchOptions } from "@/types/notification/notificationUi";

export function useNotificationFetch({
  isAuthenticated,
  setNotificationItems,
  mergeNotifications,
  realtimeFallbackRef,
}: UseNotificationFetchOptions) {
  const {
    mutateAsync: fetchNotificationsMutation,
    reset: resetFetchNotifications,
    isPending: notificationLoading,
    error: notificationError,
  } = useMutation({
    mutationFn: getNotifications,
    onSuccess: mergeNotifications,
  });

  const fetchNotifications = useCallback(
    async (limit: number, options: FetchNotificationsOptions = {}) => {
      if (!isAuthenticated) {
        setNotificationItems([]);
        return;
      }

      resetFetchNotifications();

      try {
        await fetchNotificationsMutation(limit);
      } catch {
        if (options.fallbackToRealtime) {
          setNotificationItems(realtimeFallbackRef.current.slice(0, limit));
        }
      }
    },
    [
      fetchNotificationsMutation,
      isAuthenticated,
      realtimeFallbackRef,
      resetFetchNotifications,
      setNotificationItems,
    ],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setNotificationItems([]);
      return;
    }

    void fetchNotifications(INITIAL_NOTIFICATION_LIMIT);
  }, [fetchNotifications, isAuthenticated, setNotificationItems]);

  return {
    fetchNotifications,
    notificationRequest: {
      loading: notificationLoading,
      error:
        notificationError instanceof Error ? notificationError.message : null,
    },
  };
}
