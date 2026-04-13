import { Box, Button, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CategoryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
}

export const CategoryToolbar = ({
  search,
  onSearchChange,
  onAddClick,
}: CategoryToolbarProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ flex: 1 }}
      >
        <TextField
          placeholder="Tìm theo tên danh mục..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <Box
                component="span"
                sx={{ color: "white", mr: 1, display: "flex" }}
              >
                <SearchIcon />
              </Box>
            ),
          }}
          sx={{
            bgcolor: "primary.main",
            borderRadius: 1,
            minWidth: 250,
            "& .MuiInputBase-input": {
              color: "white",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "&:hover": { bgcolor: "primary.dark" },
          }}
        />
      </Stack>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button variant="contained" onClick={onAddClick}>
          Thêm danh mục
        </Button>
      </Box>
    </Box>
  );
};
