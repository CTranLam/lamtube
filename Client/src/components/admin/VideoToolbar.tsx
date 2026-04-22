import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { UploadVideoCategory } from "../../types/video";

interface VideoToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  uploader: string;
  onUploaderChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: UploadVideoCategory[];
  loadingCategories: boolean;
  onReset: () => void;
}

export function VideoToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  uploader,
  onUploaderChange,
  categoryId,
  onCategoryChange,
  categories,
  loadingCategories,
  onReset,
}: VideoToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: "column",
        mb: 2,
      }}
    >
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <TextField
          placeholder="Tìm theo tiêu đề video..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ color: "#a1a1aa", mr: 1, display: "flex" }}>
                <SearchIcon />
              </Box>
            ),
          }}
          sx={{
            bgcolor: "rgba(255,255,255,0.04)",
            borderRadius: 1,
            minWidth: 260,
            "& .MuiInputBase-input": {
              color: "#f4f4f5",
              "&::placeholder": {
                color: "rgba(255,255,255,0.6)",
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255,255,255,0.16)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        />

        <TextField
          select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          size="small"
          sx={{
            minWidth: 180,
            bgcolor: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255,255,255,0.16)",
            },
            "& .MuiSelect-select": {
              color: "#f4f4f5",
              fontWeight: 500,
              py: "8.5px",
            },
            "& .MuiSelect-icon": { color: "#d4d4d8" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="public">Công khai</MenuItem>
          <MenuItem value="private">Riêng tư</MenuItem>
        </TextField>

        <TextField
          select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          size="small"
          disabled={loadingCategories}
          sx={{
            minWidth: 220,
            bgcolor: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255,255,255,0.16)",
            },
            "& .MuiSelect-select": {
              color: "#f4f4f5",
              fontWeight: 500,
              py: "8.5px",
            },
            "& .MuiSelect-icon": { color: "#d4d4d8" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          <MenuItem value="all">Tất cả danh mục</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={String(category.id)}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          placeholder="Tên uploader..."
          value={uploader}
          onChange={(e) => onUploaderChange(e.target.value)}
          size="small"
          sx={{
            minWidth: 220,
            bgcolor: "rgba(255,255,255,0.04)",
            borderRadius: 1,
            "& .MuiInputBase-input": {
              color: "#f4f4f5",
              "&::placeholder": {
                color: "rgba(255,255,255,0.6)",
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255,255,255,0.16)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        />
      </Stack>

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="outlined" size="small" onClick={onReset}>
          Xóa bộ lọc
        </Button>
      </Stack>
    </Box>
  );
}
