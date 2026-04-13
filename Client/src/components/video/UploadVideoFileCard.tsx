import type { ChangeEvent } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";

interface UploadVideoFileCardProps {
  videoSummary: string;
  onVideoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadVideoFileCard({
  videoSummary,
  onVideoChange,
}: UploadVideoFileCardProps) {
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
          <OndemandVideoRoundedIcon sx={{ color: "#f97316" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            File video
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#a1a1aa" }}>
          {videoSummary}
        </Typography>
        <Button
          component="label"
          variant="outlined"
          sx={{ width: "fit-content", textTransform: "none" }}
        >
          Chọn video
          <input hidden type="file" accept="video/*" onChange={onVideoChange} />
        </Button>
      </Stack>
    </Paper>
  );
}
