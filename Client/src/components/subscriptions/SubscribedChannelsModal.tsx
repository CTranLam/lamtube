import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { SubscribedChannelSummary } from "../../types/subscription";

type SubscribedChannelsModalProps = {
  open: boolean;
  channels: SubscribedChannelSummary[];
  isLoading: boolean;
  errorMessage?: string | null;
  unsubscribingChannelIds?: number[];
  onUnsubscribe?: (channelId: number) => Promise<void>;
  onClose: () => void;
};

function formatSubscribers(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function SubscribedChannelsModal({
  open,
  channels,
  isLoading,
  errorMessage,
  unsubscribingChannelIds = [],
  onUnsubscribe,
  onClose,
}: SubscribedChannelsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#0f0f0f",
          color: "#fff",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "78vh",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: 26, sm: 34 } }}>
              Tất cả kênh đã đăng ký
            </Typography>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                color: "#d4d4d4",
                borderColor: "rgba(255,255,255,0.22)",
                textTransform: "none",
              }}
            >
              Đóng
            </Button>
          </Stack>

          {isLoading ? (
            <Typography sx={{ color: "#b8b8b8" }}>Đang tải danh sách kênh...</Typography>
          ) : errorMessage ? (
            <Typography sx={{ color: "#ff8a80" }}>{errorMessage}</Typography>
          ) : channels.length === 0 ? (
            <Typography sx={{ color: "#b8b8b8" }}>
              Bạn chưa đăng ký kênh nào.
            </Typography>
          ) : (
            <Stack spacing={2.25}>
              {channels.map((channel) => (
                // Button calls unsubscribe endpoint and refreshes subscriptions list.
                <Stack
                  key={`${channel.channelId}-${channel.channelHandle}`}
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Stack direction="row" spacing={2} sx={{ maxWidth: 920 }}>
                    <Avatar
                      src={channel.avatarUrl || undefined}
                      sx={{ width: 84, height: 84, bgcolor: "#d32f2f", fontSize: 26 }}
                    >
                      {channel.channelName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {channel.channelName}
                      </Typography>
                      <Typography sx={{ color: "#afafaf", mb: 1 }}>
                        {channel.channelHandle} • {formatSubscribers(channel.subscriberCount)}{" "}
                        người đăng ký
                      </Typography>
                      <Typography sx={{ color: "#c8c8c8" }}>
                        {channel.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    startIcon={<NotificationsNoneOutlinedIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                    disabled={
                      !onUnsubscribe ||
                      channel.channelId <= 0 ||
                      unsubscribingChannelIds.includes(channel.channelId)
                    }
                    onClick={() => {
                      if (!onUnsubscribe || channel.channelId <= 0) return;
                      void onUnsubscribe(channel.channelId);
                    }}
                    sx={{
                      bgcolor: "#262626",
                      color: "#fff",
                      borderRadius: 6,
                      textTransform: "none",
                      px: 2.25,
                      "&:hover": {
                        bgcolor: "#2f2f2f",
                      },
                    }}
                  >
                    {unsubscribingChannelIds.includes(channel.channelId)
                      ? "Đang hủy..."
                      : "Đã đăng ký"}
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
