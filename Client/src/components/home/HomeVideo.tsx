import { Box } from "@mui/material";
import { useVideos } from "../../hooks/useVideos";
import { VideoGrid } from "../video/VideoGrid";
import HomeVideoItem from "./HomeVideoItem.tsx";

export default function HomeVideo() {
  const { data, isLoading, isError } = useVideos();

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        Không thể tải danh sách video. Vui lòng thử lại sau.
      </Box>
    );
  }

  if (isLoading || !data) {
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
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <HomeVideoItem key={index} />
        ))}
      </Box>
    );
  }
  return <VideoGrid videos={data} />;
}
