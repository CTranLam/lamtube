import { useCallback, useState } from "react";
import type { SnackbarCloseReason } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MENU_NOTIFICATION_LIMIT } from "@/constants/notification.constant";
import { useNotifications } from "@/hooks/useNotifications";
import type { RealtimeNotification } from "@/types/notification";
import type { NotificationToastItem } from "@/types/notification/notificationUi";
import { getNotificationId } from "@/utils/notificationDisplay";

type UseNavbarNotificationsOptions = {
  isAuthenticated: boolean;
};

export function useNavbarNotifications({
  isAuthenticated,
}: UseNavbarNotificationsOptions) {
  const navigate = useNavigate();
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [toastItems, setToastItems] = useState<NotificationToastItem[]>([]);

  const appendToast = useCallback((item: RealtimeNotification) => {
    const id = getNotificationId(item);

    setToastItems((prev) => {
      if (prev.some((toast) => toast.id === id)) {
        return prev;
      }
      const next = [{ id, item }, ...prev];
      return next.slice(0, 4);
    });
  }, []);

  const {
    notificationItems,
    notificationRequest,
    unreadTotal,
    fetchNotifications,
    markNotificationRead,
    markAllRead,
  } = useNotifications({
    isAuthenticated,
    onRealtimeNotification: appendToast,
  });
  const notificationOpen = Boolean(notificationAnchorEl);

  const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

  const handleNotificationMenuOpen = async (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setNotificationAnchorEl(event.currentTarget);
    await fetchNotifications(MENU_NOTIFICATION_LIMIT, {
      fallbackToRealtime: true,
    });
  };

  const handleNotificationAction = async (item: RealtimeNotification) => {
    handleNotificationMenuClose();
    await markNotificationRead(item);

    if (item.videoId) {
      navigate(`/watch/${item.videoId}`);
      return;
    }
    if (item.channelId) {
      navigate("/channel");
    }
  };

  const handleClearAll = () => {
    markAllRead();
    setToastItems([]);
  };

  const closeToast = (id: string, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastItems((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    notificationAnchorEl,
    notificationOpen,
    notificationItems,
    notificationRequest,
    unreadTotal,
    toastItems,
    handleNotificationMenuOpen,
    handleNotificationMenuClose,
    handleNotificationAction,
    handleClearAll,
    closeToast,
  };
}
