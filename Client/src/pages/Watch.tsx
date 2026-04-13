import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useVideo } from "../hooks/useVideo";
import WatchSkeleton from "../components/watch/WatchSkeleton";
import WatchContent from "../components/watch/WatchContent";

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const { data: video, isLoading, isError } = useVideo(videoId);

  if (isError) {
    return <Box sx={{ p: 2 }}>Không thể tải video. Vui lòng thử lại sau.</Box>;
  }

  if (isLoading || !video) {
    return <WatchSkeleton />;
  }

  return <WatchContent video={video} />;
}
