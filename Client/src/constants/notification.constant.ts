import type { RealtimeNotification } from "@/types/notification";

export const MAX_NOTIFICATION_ITEMS = 20;
export const INITIAL_NOTIFICATION_LIMIT = 20;
export const MENU_NOTIFICATION_LIMIT = 10;
export const EMPTY_NOTIFICATIONS: RealtimeNotification[] = [];
export const NOTIFICATION_QUERY_KEY = ["notifications", "navbar"] as const;
