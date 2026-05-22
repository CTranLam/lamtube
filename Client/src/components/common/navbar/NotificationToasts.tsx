import { Box, Snackbar, Typography } from "@mui/material";
import type { SnackbarCloseReason } from "@mui/material";
import type { NotificationToastItem } from "@/types/notification/notificationUi";
import {
  getNotificationText,
  getTimeLabel,
} from "@/utils/notificationDisplay";

type NotificationToastsProps = {
  items: NotificationToastItem[];
  onClose: (id: string, reason?: SnackbarCloseReason) => void;
};

export function NotificationToasts({
  items,
  onClose,
}: NotificationToastsProps) {
  return (
    <>
      {items.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={6000}
          onClose={(_, reason) => onClose(toast.id, reason)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            mt: { xs: `${68 + index * 110}px`, sm: `${76 + index * 110}px` },
            mr: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              minWidth: { xs: 280, sm: 320 },
              maxWidth: { xs: 320, sm: 420 },
              bgcolor: "#1f1f1f",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 2,
              px: 2,
              py: 1.5,
              boxShadow: "0px 12px 24px rgba(0,0,0,0.45)",
            }}
          >
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
              {getNotificationText(toast.item).title}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#d0d0d0", mt: 0.5 }}>
              {getNotificationText(toast.item).detail}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "#9e9e9e", mt: 0.5 }}>
              {getTimeLabel(toast.item)}
            </Typography>
          </Box>
        </Snackbar>
      ))}
    </>
  );
}
