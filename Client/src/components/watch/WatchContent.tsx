import { Box, Typography } from "@mui/material";
import type { Video } from "../../types/video";

type WatchContentProps = {
  video: Video;
};

export default function WatchContent({ video }: WatchContentProps) {
  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 2 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: "56.25%",
          mb: 2,
          bgcolor: "#000",
        }}
      >
        <Box
          component="iframe"
          src={video.embedUrl}
          title={video.title}
          allowFullScreen
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {video.title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
        {video.channelName} • {video.views} • {video.publishedAt}
      </Typography>
      <Typography
        variant="body2"
        sx={{ whiteSpace: "pre-line", color: "#ddd" }}
      >
        {video.description}
      </Typography>
    </Box>
  );
}
