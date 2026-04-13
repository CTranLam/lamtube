import React from "react";
import { Box, Avatar, Button, Typography } from "@mui/material";

type Props = {
  prefix: string;
  avatarPreview: string;
  fullName: string;
  isLoading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function AvatarSection({
  prefix,
  avatarPreview,
  fullName,
  isLoading,
  onAvatarChange,
}: Props) {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 2 }}
      data-testid={`${prefix}-avatar-section`}
    >
      <Avatar
        src={avatarPreview}
        sx={{ width: 72, height: 72, bgcolor: "secondary.main" }}
      >
        {fullName?.charAt(0).toUpperCase() || "U"}
      </Avatar>

      <Box>
        <Button
          variant="outlined"
          component="label"
          sx={{ textTransform: "none", borderColor: "#444", color: "#fff" }}
          disabled={isLoading}
          data-testid={`${prefix}-avatar-button`}
        >
          Chọn ảnh đại diện
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            data-testid={`${prefix}-avatar-input`}
          />
        </Button>
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, color: "#9ca3af" }}
        >
          Hỗ trợ định dạng JPG, PNG.
        </Typography>
      </Box>
    </Box>
  );
}
