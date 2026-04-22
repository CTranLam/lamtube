import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { AdminVideoSummary } from "../../types/admin";

interface VideoDetailModalProps {
  open: boolean;
  video: AdminVideoSummary | null;
  onClose: () => void;
}

function statusLabel(status: string) {
  return status === "public" ? "Công khai" : "Riêng tư";
}

export function VideoDetailModal({ open, video, onClose }: VideoDetailModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Chi tiết video
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!video ? (
          <Typography variant="body2">Không có dữ liệu.</Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Box
              component="img"
              src={video.thumbnailUrl}
              alt={video.title}
              sx={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                borderRadius: 1.5,
                bgcolor: "grey.200",
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <Chip label={statusLabel(video.status)} color={video.status === "public" ? "success" : "default"} size="small" />
              <Typography variant="caption" color="text.secondary">
                ID: {video.id}
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {video.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {video.description?.trim() ? video.description : "Không có mô tả"}
            </Typography>

            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Uploader:</strong> {video.uploaderName || "-"}</Typography>
              <Typography variant="body2"><strong>Danh mục:</strong> {video.categoryName || "Chưa có"}</Typography>
              <Typography variant="body2"><strong>Lượt xem:</strong> {new Intl.NumberFormat("vi-VN").format(video.viewCount)}</Typography>
              {video.createdAt && (
                <Typography variant="body2"><strong>Ngày tạo:</strong> {new Date(video.createdAt).toLocaleString("vi-VN")}</Typography>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
