import { DialogActions, Button } from "@mui/material";

type Props = {
  prefix: string;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
};

export default function Actions({ prefix, onClose, onSave, isLoading }: Props) {
  return (
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button
        onClick={onClose}
        sx={{ color: "#aaa", textTransform: "none" }}
        disabled={isLoading}
        data-testid={`${prefix}-cancel`}
      >
        Hủy bỏ
      </Button>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={isLoading}
        sx={{
          bgcolor: "#ef4444",
          "&:hover": { bgcolor: "#dc2626" },
          textTransform: "none",
          px: 4,
          minWidth: 100,
        }}
        data-testid={`${prefix}-save`}
      >
        {isLoading ? "Đang lưu..." : "Lưu"}
      </Button>
    </DialogActions>
  );
}
