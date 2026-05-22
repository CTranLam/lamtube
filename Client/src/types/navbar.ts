import type { SxProps, Theme } from "@mui/material";
import type { RealtimeNotification } from "./notification";

export type AccountMenuItem = {
  key: string;
  label: string;
  onClick: () => void;
  sx?: SxProps<Theme>;
};

export type NotificationMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  unreadTotal: number;
  items: RealtimeNotification[];
  request: {
    loading: boolean;
    error: string | null;
  };
  onClose: () => void;
  onNotificationAction: (item: RealtimeNotification) => void;
  onMarkAllRead: () => void;
};

export type NotificationMenuContentProps = {
  items: RealtimeNotification[];
  request: NotificationMenuProps["request"];
  onNotificationAction: (item: RealtimeNotification) => void;
};
