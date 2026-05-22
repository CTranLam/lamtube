import type { RealtimeNotification } from "./notification";
import type { NotificationDisplayData } from "./notificationDisplayData";

export enum NotificationEventType {
  Comment = "comment",
  Subscribe = "subscribe",
  Like = "like",
  Dislike = "dislike",
}

export type NotificationTemplateMap = Record<
  NotificationEventType,
  NotificationDisplayData
>;

export interface NotificationToastItem {
  id: string;
  item: RealtimeNotification;
}

export type UseNotificationsOptions = {
  isAuthenticated: boolean;
  onRealtimeNotification?: (item: RealtimeNotification) => void;
};

export type FetchNotificationsOptions = {
  fallbackToRealtime?: boolean;
};

export interface UseNotificationCacheOptions {
  isAuthenticated: boolean;
}

export interface RealtimeNotificationsRef {
  current: RealtimeNotification[];
}

export interface UseNotificationFetchOptions {
  isAuthenticated: boolean;
  setNotificationItems: (items: RealtimeNotification[]) => void;
  mergeNotifications: (items: RealtimeNotification[]) => void;
  realtimeFallbackRef: RealtimeNotificationsRef;
}

export interface UseNotificationReadActionsOptions {
  markLocalNotificationRead: (item: RealtimeNotification) => void;
  markAllLocalNotificationsRead: () => void;
  clearRealtimeNotifications: () => void;
}

export interface UseNotificationRealtimeSyncOptions {
  mergeNotifications: (items: RealtimeNotification[]) => void;
  onRealtimeNotification?: (item: RealtimeNotification) => void;
}
