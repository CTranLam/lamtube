import { Box, Typography } from "@mui/material";
import type { Video } from "../../types/video";
import { Link } from "react-router-dom";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Box
      component={Link}
      to={`/watch/${video.id}`}
      sx={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#212121",
        border: "1px solid #333",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        },
      }}
    >
      <Box
        component="img"
        src={video.thumbnailUrl}
        alt={video.title}
        sx={{
          width: "100%",
          aspectRatio: "16/9",
          objectFit: "cover",
          display: "block",
        }}
      />
      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {video.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "#aaa" }}>
          {video.channelName}
        </Typography>
        <Typography variant="caption" sx={{ color: "#777" }}>
          {video.views} • {video.publishedAt}
        </Typography>
      </Box>
    </Box>
  );
}
