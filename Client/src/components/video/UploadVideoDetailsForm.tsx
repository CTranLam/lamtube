import type { ChangeEvent } from "react";
import { MenuItem, Stack, TextField, type TextFieldProps } from "@mui/material";
import type {
  UploadVideoCategory,
  UploadVideoFormState,
} from "../../types/video";

interface UploadVideoDetailsFormProps {
  form: UploadVideoFormState;
  categories: UploadVideoCategory[];
  loadingCategories: boolean;
  onFieldChange: (
    field: keyof UploadVideoFormState,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function UploadVideoDetailsForm({
  form,
  categories,
  loadingCategories,
  onFieldChange,
}: UploadVideoDetailsFormProps) {
  const commonInputProps: TextFieldProps["slotProps"] = {
    inputLabel: { sx: { color: "#9ca3af" } },
    input: { sx: { color: "#fff" } },
  };

  return (
    <Stack spacing={2.5}>
      <TextField
        label="Tiêu đề video"
        value={form.title}
        onChange={onFieldChange("title")}
        fullWidth
        required
        slotProps={commonInputProps}
      />

      <TextField
        label="Mô tả"
        value={form.description}
        onChange={onFieldChange("description")}
        multiline
        minRows={6}
        fullWidth
        slotProps={commonInputProps}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          select
          label="Danh mục"
          value={form.categoryId}
          onChange={onFieldChange("categoryId")}
          fullWidth
          disabled={loadingCategories}
          helperText={
            loadingCategories ? "Đang tải danh mục..." : "Đã tải xong danh mục"
          }
          slotProps={{
            ...commonInputProps,
            formHelperText: { sx: { color: "#71717a" } },
          }}
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
          slotProps={commonInputProps}
        >
          <MenuItem value="public">Công khai</MenuItem>
          <MenuItem value="private">Riêng tư</MenuItem>
        </TextField>
      </Stack>
    </Stack>
  );
}
