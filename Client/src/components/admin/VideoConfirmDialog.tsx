import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface VideoConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  confirmLabel: string;
  confirmColor?: "primary" | "error";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VideoConfirmDialog({
  open,
  title,
  content,
  confirmLabel,
  confirmColor = "primary",
  loading = false,
  onClose,
  onConfirm,
}: VideoConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading}>
          {loading ? "Đang xử lý..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
