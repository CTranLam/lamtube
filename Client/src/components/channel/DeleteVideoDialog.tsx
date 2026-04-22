import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface DeleteVideoDialogProps {
  open: boolean;
  videoTitle?: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteVideoDialog({
  open,
  videoTitle,
  submitting,
  onClose,
  onConfirm,
}: DeleteVideoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>Xóa video</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Bạn có chắc muốn xóa video <strong>{videoTitle}</strong> khỏi kênh của mình không?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={submitting}>
          {submitting ? "Đang xóa..." : "Xóa video"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
