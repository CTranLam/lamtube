import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useVideo } from "../hooks/useVideo";
import { useRelatedVideos } from "../hooks/useRelatedVideos";
import WatchSkeleton from "../components/watch/WatchSkeleton";
import WatchContent from "../components/watch/WatchContent";
import WatchRelatedVideoList from "../components/watch/related/WatchRelatedVideoList";

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
  const relatedQuery = useRelatedVideos(video?.id, 20);

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
    <Box
      sx={{
        maxWidth: 1700,
        mx: "auto",
        px: { xs: 0, md: 2 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 400px" },
        gap: { xs: 2, lg: 1.75 },
        alignItems: "start",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <WatchContent
          video={video}
          isSubscribed={isSubscribed}
          subscriberCount={subscriberCount}
          isSubscribing={isSubscribing}
          subscribeError={subscribeError}
          clearSubscribeError={clearSubscribeError}
          onToggleSubscribe={toggleSubscribe}
        />
      </Box>
      <Box sx={{ px: { xs: 2, lg: 0 }, pb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.25 }}>
          Video liên quan
        </Typography>
        <WatchRelatedVideoList
          isLoading={relatedQuery.isLoading}
          isError={relatedQuery.isError}
          error={relatedQuery.error as Error | null}
          videos={relatedQuery.data ?? []}
          onRetry={() => {
            void relatedQuery.refetch();
          }}
        />
      </Box>
    </Box>
  );
}
