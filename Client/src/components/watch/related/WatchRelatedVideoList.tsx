import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import type { RelatedVideo } from "../../../types/video";
import WatchRelatedVideoItem from "./WatchRelatedVideoItem";

type WatchRelatedVideoListProps = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  videos: RelatedVideo[];
  onRetry: () => void;
};

function LoadingState() {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Stack key={index} direction="row" spacing={1.2}>
          <Skeleton
            variant="rounded"
            width={168}
            height={94}
            sx={{ flexShrink: 0, bgcolor: "rgba(255,255,255,0.12)" }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="100%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton width="88%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton width="60%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            <Skeleton width="70%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export default function WatchRelatedVideoList({
  isLoading,
  isError,
  error,
  videos,
  onRetry,
}: WatchRelatedVideoListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <Stack spacing={1} sx={{ p: 1.25, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
        <Typography variant="body2" sx={{ color: "#fca5a5" }}>
          {error?.message || "Không thể tải video liên quan."}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onRetry}
          sx={{ width: "fit-content", textTransform: "none" }}
        >
          Thử lại
        </Button>
      </Stack>
    );
  }

  if (videos.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "#a3a3a3", p: 1 }}>
        Không có video liên quan.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.3}>
      {videos.map((video) => (
        <WatchRelatedVideoItem key={video.id} video={video} />
      ))}
    </Stack>
  );
}
