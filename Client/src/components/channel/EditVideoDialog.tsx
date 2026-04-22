import { type ChangeEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { UploadVideoCategory } from "../../types/video";
import type { EditFormState } from "../../types/types";

interface EditVideoDialogProps {
  open: boolean;
  form: EditFormState | null;
  categories: UploadVideoCategory[];
  loadingCategories: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: (
    field: keyof EditFormState,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function EditVideoDialog({
  open,
  form,
  categories,
  loadingCategories,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
}: EditVideoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Sửa video</DialogTitle>
      <DialogContent>
        {form && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Tiêu đề"
              value={form.title}
              onChange={onFieldChange("title")}
              fullWidth
              required
            />
            <TextField
              label="Mô tả"
              value={form.description}
              onChange={onFieldChange("description")}
              multiline
              minRows={4}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Danh mục"
                value={form.categoryId}
                onChange={onFieldChange("categoryId")}
                fullWidth
                disabled={loadingCategories}
                helperText={loadingCategories ? "Đang tải danh mục..." : " "}
              >
                <MenuItem value="">Chưa chọn danh mục</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Hiển thị"
                value={form.status}
                onChange={onFieldChange("status")}
                fullWidth
              >
                <MenuItem value="public">Công khai</MenuItem>
                <MenuItem value="private">Riêng tư</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={!form || submitting}>
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
