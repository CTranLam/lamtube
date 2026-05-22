import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { RealtimeNotification } from "../types/notification";
import { useAuth } from "./useAuth";

const MAX_ITEMS = 20;
type UseRealtimeNotificationsOptions = {
  onNewNotification?: (payload: RealtimeNotification) => void;
};

function toSocketBaseUrl(): string {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_BASE_URL as
    | string
    | undefined;
  if (explicitSocketUrl?.trim()) {
    return explicitSocketUrl.trim();
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3000`;
}

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {},
) {
  const { onNewNotification } = options;
  const onNewNotificationRef = useRef(onNewNotification);
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] =
    useState<RealtimeNotification | null>(null);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsConnected(false);
      setLatestNotification(null);
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsConnected(false);
      return;
    }

    const socketBaseUrl = toSocketBaseUrl();
    const socket = io(`${socketBaseUrl}/notifications`, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
      withCredentials: true,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", (error) => {
      console.error("Socket connect_error:", error.message);
    });
    socket.on("notification:new", (payload: RealtimeNotification) => {
      setNotifications((prev) => [payload, ...prev].slice(0, MAX_ITEMS));
      setLatestNotification(payload);
      onNewNotificationRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    isConnected,
    notifications,
    latestNotification,
    unreadCount,
    clearNotifications,
  };
}
