import { Box } from "@mui/material";
import type { Video } from "../../types/video";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
        p: 2,
      }}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </Box>
  );
}
