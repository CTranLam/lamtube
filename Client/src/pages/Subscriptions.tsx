import { useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import { VideoGrid } from "../components/video/VideoGrid";
import HomeVideoItem from "../components/home/HomeVideoItem";
import SubscribedChannelsModal from "../components/subscriptions/SubscribedChannelsModal";
import { useAuth } from "../hooks/useAuth";
import { useSubscribedVideos } from "../hooks/useSubscribedVideos";
import { useSubscribedChannels } from "../hooks/useSubscribedChannels";
import { unsubscribeChannel } from "../api/videos";

export default function Subscriptions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unsubscribingChannelIds, setUnsubscribingChannelIds] = useState<
    number[]
  >([]);

  const {
    data: subscribedVideosData,
    isLoading: isLoadingVideos,
    isError: isVideosError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSubscribedVideos({ enabled: Boolean(user) });

  const {
    data: subscribedChannels = [],
    isLoading: isLoadingChannels,
    error: channelsError,
  } = useSubscribedChannels(Boolean(user));

  const videos = useMemo(
    () => subscribedVideosData?.pages.flatMap((page) => page.items) ?? [],
    [subscribedVideosData],
  );

  const handleUnsubscribe = async (channelId: number) => {
    if (unsubscribingChannelIds.includes(channelId)) return;

    setUnsubscribingChannelIds((prev) => [...prev, channelId]);
    try {
      await unsubscribeChannel(channelId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions", "channels"] }),
        queryClient.invalidateQueries({ queryKey: ["subscriptions", "videos"] }),
      ]);
    } finally {
      setUnsubscribingChannelIds((prev) => prev.filter((id) => id !== channelId));
    }
  };

  if (!user) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Kênh đăng ký
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Bạn cần đăng nhập để xem video từ các kênh đã đăng ký.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/login");
          }}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Đăng nhập
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Kênh đăng ký
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PlaylistPlayIcon />}
          onClick={() => {
            setIsModalOpen(true);
          }}
          sx={{
            textTransform: "none",
            color: "#fff",
            borderColor: "rgba(255,255,255,0.24)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.4)",
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          Tất cả kênh đã đăng ký ({subscribedChannels.length})
        </Button>
      </Stack>

      {isLoadingVideos ? (
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
      ) : isVideosError ? (
        <Typography sx={{ color: "#ff8a80" }}>
          Không thể tải danh sách video kênh đăng ký.
        </Typography>
      ) : videos.length === 0 ? (
        <Typography sx={{ color: "#bdbdbd" }}>
          Chưa có video mới từ các kênh bạn đã đăng ký.
        </Typography>
      ) : (
        <VideoGrid videos={videos} />
      )}

      {hasNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            sx={{ textTransform: "none", color: "#fff", borderColor: "#444" }}
          >
            {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
          </Button>
        </Box>
      )}

      <SubscribedChannelsModal
        open={isModalOpen}
        channels={subscribedChannels}
        isLoading={isLoadingChannels}
        errorMessage={channelsError instanceof Error ? channelsError.message : null}
        unsubscribingChannelIds={unsubscribingChannelIds}
        onUnsubscribe={handleUnsubscribe}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </Stack>
  );
}
