import { useMemo, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useClearWatchHistory,
  useDeleteWatchHistoryVideo,
  useWatchHistory,
} from "../hooks/useWatchHistory";
import type { WatchHistoryVideo } from "../types/watchHistory";

function formatViewCount(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} lượt xem`;
}

function formatWatchedTime(value: string): string {
  if (!value.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    data: groups = [],
    isLoading,
    isError,
    error,
  } = useWatchHistory(Boolean(user));

  const deleteAllMutation = useClearWatchHistory();
  const deleteVideoMutation = useDeleteWatchHistoryVideo();

  const totalItems = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups],
  );

  const displayError = useMemo(() => {
    if (localError) return localError;
    if (deleteAllMutation.error instanceof Error) return deleteAllMutation.error.message;
    if (deleteVideoMutation.error instanceof Error) return deleteVideoMutation.error.message;
    if (error instanceof Error) return error.message;
    return null;
  }, [deleteAllMutation.error, deleteVideoMutation.error, error, localError]);

  const handleDeleteAll = async () => {
    if (!totalItems || deleteAllMutation.isPending) return;
    const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử xem?");
    if (!confirmed) return;
    setLocalError(null);
    try {
      await deleteAllMutation.mutateAsync();
    } catch {
      setLocalError("Không thể xóa toàn bộ lịch sử xem.");
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (deleteVideoMutation.isPending) return;
    setLocalError(null);
    try {
      await deleteVideoMutation.mutateAsync(videoId);
    } catch {
      setLocalError("Không thể xóa video khỏi lịch sử.");
    }
  };

  if (!user) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Nhật ký xem
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Bạn cần đăng nhập để xem lịch sử.
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
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          maxWidth: 1220,
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 },
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            color: "#fff",
            border: "1px solid #2f2f2f",
            background:
              "linear-gradient(115deg, rgba(36,36,36,0.96) 0%, rgba(17,17,17,0.96) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryRoundedIcon sx={{ color: "#9ad0ff" }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
                Nhật ký xem
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => {
                void handleDeleteAll();
              }}
              disabled={!totalItems || deleteAllMutation.isPending}
              sx={{ textTransform: "none", borderColor: "#7a3c3c", color: "#ffb4b4" }}
            >
              {deleteAllMutation.isPending ? "Đang xóa..." : "Xóa tất cả lịch sử"}
            </Button>
          </Stack>
        </Paper>

        {isLoading && (
          <Typography sx={{ color: "#bdbdbd" }}>Đang tải lịch sử xem...</Typography>
        )}

        {(isError || displayError) && (
          <Typography sx={{ color: "#ff8a80" }}>
            {displayError ?? "Không thể tải lịch sử xem."}
          </Typography>
        )}

        {!isLoading && !isError && totalItems === 0 && (
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed #3f3f3f",
              bgcolor: "#141414",
            }}
          >
            <Typography sx={{ color: "#d0d0d0", fontWeight: 700, mb: 0.75 }}>
              Chưa có video nào trong lịch sử xem
            </Typography>
            <Typography sx={{ color: "#9f9f9f" }}>
              Các video bạn đã xem sẽ hiển thị tại đây.
            </Typography>
          </Paper>
        )}

        {!isLoading &&
          !isError &&
          groups.map((group) => (
            <Paper
              key={group.date}
              sx={{
                p: { xs: 1.2, md: 1.6 },
                borderRadius: 3,
                bgcolor: "#111111",
                border: "1px solid #242424",
              }}
            >
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 700, color: "#ececec", px: 0.4 }}>
                  {group.label}
                </Typography>

                {group.items.map((item) => (
                  <HistoryItem
                    key={`${group.date}-${item.videoId}`}
                    item={item}
                    isDeleting={deleteVideoMutation.isPending}
                    deletingVideoId={deleteVideoMutation.variables ?? null}
                    onDelete={handleDeleteVideo}
                  />
                ))}
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Box>
  );
}

type HistoryItemProps = {
  item: WatchHistoryVideo;
  isDeleting: boolean;
  deletingVideoId: number | null;
  onDelete: (videoId: number) => Promise<void>;
};

function HistoryItem({ item, isDeleting, deletingVideoId, onDelete }: HistoryItemProps) {
  const isDeletingCurrent = isDeleting && deletingVideoId === item.videoId;

  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: "#151515",
        border: "1px solid #2b2b2b",
        transition: "all 0.2s ease",
        "&:hover": { borderColor: "#4a4a4a", bgcolor: "#1a1a1a" },
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Box
          component={Link}
          to={`/watch/${item.videoId}`}
          sx={{
            display: "flex",
            flex: 1,
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            minWidth: 0,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box
            component="img"
            src={item.thumbnailUrl}
            alt={item.title}
            sx={{
              width: { xs: "100%", sm: 240 },
              aspectRatio: "16/9",
              borderRadius: 1.5,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 15, sm: 19 },
                fontWeight: 700,
                mb: 0.75,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#c2c2c2", mb: 0.4 }}>
              {item.uploaderName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#8f8f8f" }}>
              {formatViewCount(item.viewCount)}
              {formatWatchedTime(item.watchedAt)
                ? ` • Đã xem lúc ${formatWatchedTime(item.watchedAt)}`
                : ""}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "row", md: "column" }}
          spacing={1}
          justifyContent="center"
          sx={{ minWidth: { xs: "auto", md: 190 } }}
        >
          <Button
            component={Link}
            to={`/watch/${item.videoId}`}
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Xem lại
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => {
              void onDelete(item.videoId);
            }}
            disabled={isDeletingCurrent}
            sx={{ textTransform: "none", borderColor: "#7a3c3c", color: "#ffb4b4" }}
          >
            {isDeletingCurrent ? "Đang xóa..." : "Xóa khỏi lịch sử"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
