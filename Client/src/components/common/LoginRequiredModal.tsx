import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type LoginRequiredModalProps = {
  open: boolean;
  onLogin: () => void;
  onClose: () => void;
};

function LoginRequiredModal({
  open,
  onLogin,
  onClose,
}: LoginRequiredModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-required-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: "#181818",
          color: "#fff",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.08)",
          px: 2,
        },
      }}
    >
      <DialogTitle id="login-required-dialog-title" sx={{ fontWeight: 600 }}>
        Cần đăng nhập
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#e5e5e5" }}>
          Bạn cần đăng nhập để truy cập kênh của bạn.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#9ca3af", textTransform: "none" }}
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          onClick={onLogin}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Đăng nhập ngay
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LoginRequiredModal;
