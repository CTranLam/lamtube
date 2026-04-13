import type { ChangeEvent } from "react";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

interface UploadThumbnailCardProps {
  thumbnailPreview: string;
  onThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadThumbnailCard({
  thumbnailPreview,
  onThumbnailChange,
}: UploadThumbnailCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ImageRoundedIcon sx={{ color: "#38bdf8" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Thumbnail
          </Typography>
        </Box>

        <Avatar
          variant="rounded"
          src={thumbnailPreview || undefined}
          sx={{
            width: "100%",
            height: 180,
            bgcolor: "#18181b",
            borderRadius: 3,
          }}
        >
          <ImageRoundedIcon sx={{ fontSize: 42, color: "#52525b" }} />
        </Avatar>

        <Button
          component="label"
          variant="outlined"
          sx={{ width: "fit-content", textTransform: "none" }}
        >
          Chọn thumbnail
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={onThumbnailChange}
          />
        </Button>
      </Stack>
    </Paper>
  );
}
