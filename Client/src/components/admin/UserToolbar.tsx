import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface UserToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleChange: (val: string) => void;
  roles: string[];
  onAddClick: () => void;
}

export const UserToolbar = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  roles,
  onAddClick,
}: UserToolbarProps) => {
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
          placeholder="Tìm theo email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <Box
                component="span"
                sx={{ color: "#a1a1aa", mr: 1, display: "flex" }}
              >
                <SearchIcon />
              </Box>
            ),
          }}
          sx={{
            bgcolor: "rgba(255,255,255,0.04)",
            borderRadius: 1,
            minWidth: 250,
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
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          size="small"
          SelectProps={{
            displayEmpty: true,
            renderValue: (value: string | unknown) => {
              if (value === "all") return "Tất cả vai trò";
              return String(value ?? "");
            },
          }}
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
          <MenuItem value="all">Tất cả vai trò</MenuItem>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button variant="contained" onClick={onAddClick}>
          Thêm người dùng
        </Button>
      </Box>
    </Box>
  );
};
