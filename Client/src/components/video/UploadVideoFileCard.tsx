import type { ChangeEvent } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";

interface UploadVideoFileCardProps {
  videoSummary: string;
  videoPreview: string;
  previewLabel: string | null;
  onVideoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadVideoFileCard({
  videoSummary,
  videoPreview,
  previewLabel,
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

        <Box
          sx={{
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "#09090b",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              color: "#a1a1aa",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Xem trước video
            </Typography>
            {previewLabel && (
              <Typography variant="caption" sx={{ color: "#f97316" }}>
                {previewLabel}
              </Typography>
            )}
          </Box>

          {videoPreview ? (
            <Box
              component="video"
              src={videoPreview}
              controls
              preload="metadata"
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 280,
                bgcolor: "#000",
              }}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ minHeight: 220, color: "#52525b" }}
            >
              <OndemandVideoRoundedIcon sx={{ fontSize: 44 }} />
              <Typography variant="body2">
                Chưa có video để xem trước
              </Typography>
            </Stack>
          )}
        </Box>

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
