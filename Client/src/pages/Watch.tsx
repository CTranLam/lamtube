import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useVideo } from "../hooks/useVideo";
import WatchSkeleton from "../components/watch/WatchSkeleton";
import WatchContent from "../components/watch/WatchContent";

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const {
    video,
    isLoading,
    isError,
    error,
    isSubscribed,
    subscriberCount,
    isSubscribing,
    subscribeError,
    clearSubscribeError,
    toggleSubscribe,
  } = useVideo(videoId);

  if (isLoading) {
    return <WatchSkeleton />;
  }

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        {(error as Error | null)?.message ||
          "Không thể tải video. Vui lòng thử lại sau."}
      </Box>
    );
  }

  if (!video) {
    return <Box sx={{ p: 2 }}>Video không tồn tại hoặc đã bị gỡ.</Box>;
  }

  return (
    <WatchContent
      video={video}
      isSubscribed={isSubscribed}
      subscriberCount={subscriberCount}
      isSubscribing={isSubscribing}
      subscribeError={subscribeError}
      clearSubscribeError={clearSubscribeError}
      onToggleSubscribe={toggleSubscribe}
    />
  );
}
