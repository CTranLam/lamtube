import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

type FeedbackType = "bug" | "feature" | "other";

type FeedbackFormState = {
  type: FeedbackType;
  title: string;
  content: string;
  contactEmail: string;
};

const initialForm: FeedbackFormState = {
  type: "bug",
  title: "",
  content: "",
  contactEmail: "",
};

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState<FeedbackFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return form.title.trim().length > 0 && form.content.trim().length > 0;
  }, [form.content, form.title]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError("Vui lòng nhập tiêu đề và nội dung phản hồi.");
      return;
    }

    try {
      setIsSubmitting(true);

      await new Promise((resolve) => {
        setTimeout(resolve, 800);
      });

      setSuccess("Đã gửi phản hồi. Cảm ơn bạn đã đóng góp cho LamTube.");
      setForm((prev) => ({ ...initialForm, contactEmail: prev.contactEmail }));
    } catch {
      setError("Gửi phản hồi thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Gửi phản hồi
      </Typography>
      <Typography variant="body2" sx={{ color: "#aaaaaa", mb: 3 }}>
        Chia sẻ lỗi bạn gặp hoặc đề xuất tính năng mới.
      </Typography>

      <Paper sx={{ bgcolor: "#181818", p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            select
            label="Loại phản hồi"
            value={form.type}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, type: event.target.value as FeedbackType }));
            }}
            fullWidth
          >
            <MenuItem value="bug">Báo lỗi</MenuItem>
            <MenuItem value="feature">Đề xuất tính năng</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </TextField>

          <TextField
            label="Tiêu đề"
            value={form.title}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, title: event.target.value }));
            }}
            fullWidth
          />

          <TextField
            label="Nội dung phản hồi"
            value={form.content}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, content: event.target.value }));
            }}
            fullWidth
            multiline
            minRows={5}
          />

          <TextField
            label="Email liên hệ (không bắt buộc)"
            value={form.contactEmail || user?.email || ""}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, contactEmail: event.target.value }));
            }}
            fullWidth
            type="email"
          />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              disabled={!canSubmit || isSubmitting}
              onClick={() => {
                void handleSubmit();
              }}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              disabled={isSubmitting}
              onClick={() => {
                setForm(initialForm);
                setError(null);
                setSuccess(null);
              }}
            >
              Xóa nội dung
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
