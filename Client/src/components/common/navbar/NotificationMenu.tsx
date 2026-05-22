import { Box, Menu, MenuItem, Typography } from "@mui/material";
import {
  getNotificationId,
  getNotificationSummary,
  getNotificationText,
  getTimeLabel,
} from "@/utils/notificationDisplay";
import type { NotificationMenuProps } from "@/types/navbar";
import type { NotificationMenuContentProps } from "@/types/navbar";

function NotificationMenuContent({
  items,
  request,
  onNotificationAction,
}: NotificationMenuContentProps) {
  if (request.loading) {
    return <MenuItem disabled>Đang tải thông báo...</MenuItem>;
  }

  if (request.error) {
    return <MenuItem disabled>{request.error}</MenuItem>;
  }

  if (items.length === 0) {
    return <MenuItem disabled>Chưa có thông báo nào</MenuItem>;
  }

  return items.map((item) => (
    <MenuItem
      key={getNotificationId(item)}
      onClick={() => onNotificationAction(item)}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
          {getNotificationText(item).title}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "#cfcfcf" }}>
          {getNotificationSummary(item)}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "#9e9e9e" }}>
          {getTimeLabel(item)}
        </Typography>
      </Box>
    </MenuItem>
  ));
}

export function NotificationMenu({
  anchorEl,
  open,
  unreadTotal,
  items,
  request,
  onClose,
  onNotificationAction,
  onMarkAllRead,
}: NotificationMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            bgcolor: "#282828",
            color: "#fff",
            minWidth: 340,
            maxWidth: 420,
            boxShadow: "0px 8px 16px rgba(0,0,0,0.4)",
            "& .MuiMenuItem-root": {
              py: 1.25,
              px: 1.5,
              fontSize: 14,
              alignItems: "flex-start",
              whiteSpace: "normal",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            },
          },
        },
      }}
    >
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          Thông báo
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#9e9e9e", mt: 0.25 }}>
          {unreadTotal > 0
            ? `${unreadTotal} thông báo chưa đọc`
            : "Không có thông báo mới"}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />

      <NotificationMenuContent
        items={items}
        request={request}
        onNotificationAction={onNotificationAction}
      />

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      <MenuItem
        onClick={() => {
          onClose();
          onMarkAllRead();
        }}
      >
        Đánh dấu đã đọc
      </MenuItem>
    </Menu>
  );
}
