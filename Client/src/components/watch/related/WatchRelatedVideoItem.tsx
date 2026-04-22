import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type { RelatedVideo } from "../../../types/video";

type WatchRelatedVideoItemProps = {
  video: RelatedVideo;
};

function formatViewCount(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.max(0, value))} lượt xem`;
}

function formatPublishedAt(value: string): string {
  if (!value.trim()) return "Mới đăng";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Mới đăng";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return "Vừa xong";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function WatchRelatedVideoItem({ video }: WatchRelatedVideoItemProps) {
  return (
    <Box
      component={Link}
      to={`/watch/${video.id}`}
      sx={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2,
        p: 0.75,
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.06)",
        },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Box
          sx={{
            position: "relative",
            minWidth: 168,
            width: 168,
            borderRadius: 1.5,
            overflow: "hidden",
            bgcolor: "#1f1f1f",
            flexShrink: 0,
            aspectRatio: "16/9",
          }}
        >
          <Box
            component="img"
            src={video.thumbnailUrl}
            alt={video.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {video.duration?.trim() ? (
            <Box
              sx={{
                position: "absolute",
                bottom: 6,
                right: 6,
                px: 0.6,
                py: 0.2,
                borderRadius: 0.75,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: "rgba(0,0,0,0.82)",
              }}
            >
              {video.duration}
            </Box>
          ) : null}
        </Box>

        <Box sx={{ minWidth: 0, pt: 0.15 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 0.45,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {video.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#b8b8b8",
              lineHeight: 1.4,
            }}
          >
            {video.uploaderName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#8f8f8f",
              lineHeight: 1.4,
            }}
          >
            {formatViewCount(video.viewCount)} • {formatPublishedAt(video.createdAt)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
